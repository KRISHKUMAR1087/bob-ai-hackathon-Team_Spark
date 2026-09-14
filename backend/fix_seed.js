
const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf8');

if (!code.includes('import bcrypt')) {
  code = code.replace(
    /import \{ PrismaClient \} from '@prisma\/client';/,
    'import { PrismaClient } from \\'@prisma/client\\';\\nimport bcrypt from \\'bcryptjs\\';'
  );
  
  code = code.replace(
    /async function main\(\): Promise<void> \{/,
    'async function main(): Promise<void> {\\n  const adminPasswordHash = await bcrypt.hash(\\'Admin@2026!\\', 10);\\n  const agentPasswordHash = await bcrypt.hash(\\'Agent@2026!\\', 10);'
  );

  code = code.replace(
    /email: 'admin@portpulse\.demo',\n\s*role: 'admin',/,
    'email: \\'admin@portpulse.demo\\',\\n      password: adminPasswordHash,\\n      role: \\'admin\\','
  );

  code = code.replace(
    /email: 'agent@portpulse\.demo',\n\s*role: 'ship_agent',/,
    'email: \\'agent@portpulse.demo\\',\\n      password: agentPasswordHash,\\n      role: \\'ship_agent\\','
  );

  fs.writeFileSync('prisma/seed.ts', code);
  console.log('Fixed seed');
}

