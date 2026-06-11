import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = 'C:\\Users\\vippi\\.gemini\\antigravity\\brain\\1c36d970-6237-451a-aee2-ebd856456de9\\learning_illustration_1778662120201.png';
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (err) {
    return new Response('Image not found', { status: 404 });
  }
}
