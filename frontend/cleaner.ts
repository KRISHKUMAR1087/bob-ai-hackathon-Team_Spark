import { Project } from "ts-morph";
import * as fs from "fs";
import { execSync } from "child_process";

// 1. Run tsc --noEmit and get output
let tscOutput = "";
try {
  tscOutput = execSync("npx tsc --noEmit", { encoding: "utf8" });
} catch (e: any) {
  tscOutput = e.stdout;
}

// 2. Parse TS6133 errors
const regex = /(.+)\(\d+,\d+\): error TS6133: '(.+)' is declared but its value is never read./g;
let match;
const unusedByFile: Record<string, string[]> = {};

while ((match = regex.exec(tscOutput)) !== null) {
  const file = match[1];
  const name = match[2];
  if (!unusedByFile[file]) unusedByFile[file] = [];
  unusedByFile[file].push(name);
}

// 3. Use ts-morph to remove the unused variables/imports
const project = new Project();
project.addSourceFilesAtPaths("c:/Users/ASUS/Documents/GitHub/bob-ai-hackathon-Team_Spark/frontend/src/**/*.tsx");
project.addSourceFilesAtPaths("c:/Users/ASUS/Documents/GitHub/bob-ai-hackathon-Team_Spark/frontend/src/**/*.ts");

for (const [filePath, unusedNames] of Object.entries(unusedByFile)) {
  const absolutePath = "c:/Users/ASUS/Documents/GitHub/bob-ai-hackathon-Team_Spark/frontend/" + filePath;
  const sourceFile = project.getSourceFile(absolutePath);
  if (!sourceFile) {
    console.log(`Could not find source file: ${absolutePath}`);
    continue;
  }

  let modified = false;

  // Process unused imports
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDecl of importDeclarations) {
    const namedImports = importDecl.getNamedImports();
    
    // Remove unused named imports
    for (const namedImport of namedImports) {
      const name = namedImport.getName();
      if (unusedNames.includes(name)) {
        namedImport.remove();
        modified = true;
      }
    }
    
    // Remove default import if unused
    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport && unusedNames.includes(defaultImport.getText())) {
        importDecl.removeDefaultImport();
        modified = true;
    }

    // If import statement becomes completely empty
    if (importDecl.getNamedImports().length === 0 && !importDecl.getDefaultImport() && !importDecl.getNamespaceImport()) {
        if (modified) {
            importDecl.remove();
        }
    }
  }

  // Also remove unused variables
  for (const varDecl of sourceFile.getVariableDeclarations()) {
    if (unusedNames.includes(varDecl.getName())) {
      varDecl.remove();
      modified = true;
    }
  }

  if (modified) {
    sourceFile.saveSync();
    console.log(`Cleaned unused in ${absolutePath}`);
  }
}
