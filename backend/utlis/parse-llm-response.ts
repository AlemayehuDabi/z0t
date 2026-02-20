import { FileNode } from '../ai/graph';
import * as path from 'path';

// extract the files in the `Record<string, FileNode>` format form the llm response
export const parseLLMResponse = (text: string): Record<string, FileNode> => {
  const files: Record<string, FileNode> = {}; // start empty
  const date = Date.now();

  // Remove accidental markdown fences
  const cleanedText = text.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/```/g, ''),
  );

  // Regex to match <file path="...">...</file>
  // [^"]+ matches the path inside quotes
  // [\s\S]*? matches everything inside (including newlines), non-greedy
  const regex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;

  let match;

  while ((match = regex.exec(cleanedText)) !== null) {
    let [_, rawPath, content] = match;

    if (!rawPath) continue;

    // Normalize slashes to POSIX style
    let normalized = rawPath.replace(/\\/g, '/');
    normalized = path.posix.normalize(normalized);

    // Security: block absolute paths & traversal
    if (normalized.startsWith('/') || normalized.includes('..')) {
      console.warn(`Skipping unsafe path: ${rawPath}`);
      continue;
    }

    // Trim only outer whitespace (preserve internal formatting)
    content = content.replace(/^\n+|\n+$/g, '');

    if (!content.trim()) {
      console.warn(`Skipping empty file: ${normalized}`);
      continue;
    }

    // Prevent accidental overwrite
    if (files[normalized]) {
      console.warn(`Duplicate file detected, skipping: ${normalized}`);
      continue;
    }

    // add the objects
    files[normalized] = {
      path: normalized,
      content,
      isBinary: false,
      lastUpdated: date,
    };
  }

  return files;
};
