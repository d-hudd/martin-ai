// lib/fileUtils.js
import { promises as fs } from 'fs';
import { join } from 'path';

export const sanitizePath = (path) => {
  // Remove any attempts to traverse directories
  return path.replace(/\.\./g, '').replace(/^\/+/, '');
};

export const getFullPath = (relativePath) => {
  const safePath = sanitizePath(relativePath);
  return join(process.cwd(), safePath);
};

export const ensureDirectoryExists = async (filepath) => {
  const directory = filepath.split('/').slice(0, -1).join('/');
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
};

export const isValidPath = (path) => {
  // Add any additional validation you need
  if (!path) return false;
  if (path.includes('..')) return false;
  if (path.includes('node_modules')) return false;
  return true;
};