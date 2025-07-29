import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';
import { pdfToText } from 'pdf-ts';

const textPlainTypes = [
  'application/x-www-form-urlencoded',
  'application/json',
  'application/xml',
  'text/markdown',
  'text/plain',
  'text/html',
  'text/csv',
];

const textPlainExtensions = ['.txt', '.md', '.json', '.xml', '.html', '.csv'];

export const getPathType = (input: string) => {
  try {
    const url = new URL(input);
    if (url.protocol === 'file:') {
      return 'uri';
    }
    if (['http:', 'https:', 'ftp:'].includes(url.protocol)) {
      return 'url';
    }
    return 'text';
  } catch {
    if (input.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(input)) {
      return 'uri';
    }
    return 'text';
  }
};

export const getContentExternal = async (input: string): Promise<string> => {
  const type = getPathType(input);

  if (!input) {
    throw new Error('No guidelines provided for analysis.');
  }

  if (type === 'uri') {
    const filePath = input.replace('file:', '');

    if (fs.existsSync(filePath)) {
      const extension = path.extname(filePath).toLowerCase();

      if (textPlainExtensions.includes(extension)) {
        return fs.readFileSync(filePath, 'utf-8');
      } else if (extension === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const buffer = Buffer.from(dataBuffer);

        return await pdfToText(buffer);
      }

      throw new Error(
        `Unsupported local file type: ${extension} for guidelines at ${filePath}`
      );
    }

    throw new Error(`Guidelines file not found at ${filePath}`);
  } else if (type === 'url') {
    const response = await fetch(input);

    if (!response.ok) {
      throw new Error(`Failed to fetch guidelines from ${input}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (textPlainTypes.some((t) => contentType.includes(t))) {
      return response.text();
    } else if (contentType.includes('application/pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return await pdfToText(buffer);
    } else {
      throw new Error(
        `Unsupported remote file type: ${contentType} for guidelines at ${input}`
      );
    }
  } else {
    return input;
  }
};
