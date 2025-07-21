import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerEmailServices } from './services/email';

const server = new McpServer({
  name: 'email-summarizer',
  version: '1.0.0',
});

registerEmailServices(server);

const transport = new StdioServerTransport();

await server.connect(transport).catch((error) => {
  console.error('Failed to connect server:', error);
  process.exit(1);
});
