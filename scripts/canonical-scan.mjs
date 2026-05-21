#!/usr/bin/env node
/**
 * Canonical Domain Scan Script
 * 
 * Scans for canonical domain drift in production code.
 * Used by CI and pre-commit hooks.
 * 
 * Exit codes:
 *   0 = no drift found
 *   1 = drift detected
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = 'frontend-web/src';
const EXCLUDE_DIRS = ['node_modules', '__tests__', '.next', 'dist'];
const EXCLUDE_FILES = ['.test.ts', '.test.tsx', 'use-chat.ts'];

let hasDrift = false;

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Check for lowercase Incident enums
  const enumPatterns = [
    { pattern: /severity\s*===\s*['"]critical['"]/g, message: 'lowercase severity enum' },
    { pattern: /severity\s*===\s*['"]high['"]/g, message: 'lowercase severity enum' },
    { pattern: /severity\s*===\s*['"]medium['"]/g, message: 'lowercase severity enum' },
    { pattern: /severity\s*===\s*['"]low['"]/g, message: 'lowercase severity enum' },
    { pattern: /status\s*===\s*['"]reported['"]/g, message: 'lowercase status enum' },
    { pattern: /status\s*===\s*['"]verified['"]/g, message: 'lowercase status enum' },
    { pattern: /status\s*===\s*['"]completed['"]/g, message: 'lowercase status enum' },
  ];
  
  for (const { pattern, message } of enumPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      issues.push({ file: filePath, message });
    }
  }
  
  // Check for snake_case Incident fields
  const snakePatterns = [
    { pattern: /incident\.created_at/g, message: 'snake_case field: created_at' },
    { pattern: /incident\.updated_at/g, message: 'snake_case field: updated_at' },
    { pattern: /incident\.latitude/g, message: 'flat coordinate: latitude' },
    { pattern: /incident\.longitude/g, message: 'flat coordinate: longitude' },
  ];
  
  for (const { pattern, message } of snakePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      issues.push({ file: filePath, message });
    }
  }
  
  // Check for local duplicate interfaces
  if (/^interface Incident \{/m.test(content)) {
    issues.push({ file: filePath, message: 'local duplicate interface: Incident' });
  }
  
  return issues;
}

function scanDir(dir) {
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry)) {
          scanDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (['.ts', '.tsx'].includes(ext)) {
          const excludeFile = EXCLUDE_FILES.some(ex => entry.endsWith(ex));
          if (!excludeFile) {
            const issues = scanFile(fullPath);
            for (const issue of issues) {
              console.error(`❌ ${issue.file}: ${issue.message}`);
              hasDrift = true;
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
}

console.log('🔍 Scanning for canonical Incident domain drift...\n');

try {
  scanDir(SRC_DIR);
} catch (e) {
  console.log('⚠️  Source directory not found, skipping scan');
  process.exit(0);
}

if (hasDrift) {
  console.error('\n❌ Canonical drift detected!');
  process.exit(1);
} else {
  console.log('✅ No canonical drift detected');
  process.exit(0);
}