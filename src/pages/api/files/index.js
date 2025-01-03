// pages/api/files/index.js
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path, content } = req.body;
    
    // Sanitize and validate the path to prevent directory traversal
    const safePath = join(process.cwd(), path.replace(/\.\./g, ''));
    
    // Write the file
    await writeFile(safePath, content, 'utf8');
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
}