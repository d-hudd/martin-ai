// middleware/fileSystem.js
import { isValidPath } from '../lib/fileUtils';

export function validateFilePath(req, res, next) {
  const path = req.body.path || req.query.path;
  
  if (!isValidPath(path)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  
  next();
}

export function handleFileSystemError(error, req, res, next) {
  console.error('File System Error:', error);
  
  if (error.code === 'ENOENT') {
    return res.status(404).json({ error: 'File not found' });
  }
  
  if (error.code === 'EACCES') {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  res.status(500).json({ error: 'File system error' });
}