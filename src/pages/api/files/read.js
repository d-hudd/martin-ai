// pages/api/files/read.js
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Sanitize the path
    const safePath = join(process.cwd(), path.replace(/\.\./g, ''));
    
    // Read the file
    const content = await readFile(safePath, 'utf8');
    
    res.status(200).json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
}