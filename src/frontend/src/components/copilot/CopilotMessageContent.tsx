import React from 'react';
import { CopilotMessage } from '../../types/operations';
import { CopilotTable } from './CopilotTable';
import { CopilotChartVisual } from './CopilotChartVisual';

interface CopilotMessageContentProps {
  message: CopilotMessage;
}

// Clean inline text formatting (bold, links, code, stripping raw markdown artifacts)
const renderFormattedInlineText = (text: string): React.ReactNode => {
  // Strip unwanted escapes like \*\*, \####, \---
  let cleanText = text
    .replace(/\\(\*|#|-|_)/g, '$1')
    .replace(/^#+\s+/g, '');

  // Split by bold (**bold** or __bold__)
  const boldRegex = /(\*\*([^*]+)\*\*|__([^_]+)__)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleanText.substring(lastIndex, match.index));
    }
    const boldContent = match[2] || match[3];
    parts.push(
      <strong key={match.index} className="font-semibold text-text-main">
        {boldContent}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleanText.length) {
    parts.push(cleanText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : cleanText;
};

// Check if a line is a markdown table row
const isTableRow = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
};

const isTableDivider = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && /^[|\s\-:]+$/.test(trimmed);
};

export const CopilotMessageContent: React.FC<CopilotMessageContentProps> = ({ message }) => {
  const { structured, text } = message;

  // 1. If structured payload is present
  if (structured && (structured.message || (structured.blocks && structured.blocks.length > 0))) {
    return (
      <div className="space-y-3">
        {/* Main message text */}
        {structured.message && (
          <div className="space-y-2 leading-relaxed text-xs text-text-main">
            {structured.message.split('\n\n').map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').filter(i => i.trim().startsWith('- ') || i.trim().startsWith('* '));
                return (
                  <ul key={pIdx} className="space-y-1 list-disc pl-4 my-1.5 text-xs text-text-main">
                    {items.map((item, iIdx) => (
                      <li key={iIdx}>
                        {renderFormattedInlineText(item.replace(/^[-*]\s+/, ''))}
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed">
                  {renderFormattedInlineText(trimmed)}
                </p>
              );
            })}
          </div>
        )}

        {/* Structured visual blocks (Tables, Charts) */}
        {structured.blocks && structured.blocks.length > 0 && (
          <div className="space-y-3 pt-1">
            {structured.blocks.map((block, bIdx) => {
              if (block.type === 'table' && block.columns && block.rows) {
                return (
                  <CopilotTable
                    key={bIdx}
                    title={block.title}
                    columns={block.columns}
                    rows={block.rows}
                  />
                );
              }

              if (block.type === 'chart' && block.chartType && block.data) {
                return (
                  <CopilotChartVisual
                    key={bIdx}
                    chartType={block.chartType}
                    title={block.title}
                    data={block.data}
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. Fallback: Parse plain text message cleanly, detecting any Markdown tables or formatting
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (keyIndex: number) => {
    if (tableBuffer.length >= 2) {
      const headerLine = tableBuffer[0];
      const dataLines = tableBuffer.slice(1).filter(l => !isTableDivider(l));

      const columns = headerLine
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());

      const rows = dataLines.map(line =>
        line
          .split('|')
          .slice(1, -1)
          .map(cell => cell.trim())
      );

      renderedElements.push(
        <CopilotTable key={`tbl-${keyIndex}`} columns={columns} rows={rows} />
      );
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for markdown table line
    if (isTableRow(trimmed)) {
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable(i);
    }

    if (!trimmed) {
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      renderedElements.push(<hr key={i} className="my-2 border-border-subtle" />);
      continue;
    }

    // Heading (### Heading or ## Heading)
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      renderedElements.push(
        <h4 key={i} className="text-xs font-bold text-text-main mt-2 mb-1">
          {renderFormattedInlineText(headingText)}
        </h4>
      );
      continue;
    }

    // Blockquote (> text)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      renderedElements.push(
        <div
          key={i}
          className="p-2.5 my-1.5 rounded-xl bg-surface-subtle border-l-2 border-brand-teal text-xs text-text-muted leading-relaxed"
        >
          {renderFormattedInlineText(quoteText)}
        </div>
      );
      continue;
    }

    // Bullet List Item (* item or - item)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.replace(/^[*\-]\s+/, '');
      renderedElements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 text-xs text-text-main">
          <span className="text-brand-teal mt-1 text-[8px]">•</span>
          <span className="leading-relaxed">{renderFormattedInlineText(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Numbered List Item (1. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 text-xs text-text-main">
          <span className="font-semibold text-text-muted text-[11px] shrink-0 w-4">
            {numMatch[1]}.
          </span>
          <span className="leading-relaxed">{renderFormattedInlineText(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular Paragraph
    renderedElements.push(
      <p key={i} className="leading-relaxed my-1">
        {renderFormattedInlineText(trimmed)}
      </p>
    );
  }

  if (tableBuffer.length > 0) {
    flushTable(lines.length);
  }

  return <div className="space-y-1 text-xs text-text-main leading-relaxed">{renderedElements}</div>;
};

