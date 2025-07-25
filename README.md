# Email Summarizer

This project is designed to summarize emails using a custom IMAP client to connect to the user's email inbox and retrieve relevant messages based on specified criteria.

## Features
- Connects to an IMAP server to fetch emails.
- Can filter emails by:
  - Subject
  - Date range
  - Sender email address
  - Mailbox (default is 'INBOX')

## Requirements
Setup the env vars:
- `MCP_EMAIL_USER`: Your email address.
- `MCP_EMAIL_APP_PASSWORD`: Your email app password (you will need to generate this from your email provider).

## Usage

### Command (NPM)
1. Install dependencies `pnpm install -g @cardor/email-summarizer`.
2. Add the configuration to your app client.
```json
"email-summarizer": {
  "command": "cardor-email-summarizer",
  "env": {
    "EMAIL_USERNAME": "<your-email>",
    "EMAIL_PASSWORD": "<your-app-password>",
    "EMAIL_PORT": "993", 
    "EMAIL_CLIENT_TYPE": "gmail"
  }
}
```

### Command (Without Docker)
1. Install dependencies `pnpm install`.
2. Add the configuration to your app client.
3. Ensure add EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_CLIENT_TYPE as environment variables.
```json
"email-stdio": {
  "command": "npx",
  "args": [
    "-y",
    "tsx",
    "path/to/mcp/folder/main.ts"
  ]
}
```

### Command (With Docker)
1. Build the Docker image `pnpm run docker:build`
2. Add the configuration to your app client.
```json
"email-dock": {
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "-e",
    "EMAIL_USERNAME=<your-email>",
    "-e",
    "EMAIL_PASSWORD=<your-app-password>",
    "email-summarizer"
  ]
}
```

### Stream HTTP requests
You can also use the HTTP API to interact with the email summarizer. The API expects the following headers:
- Build the MCP `pnpm run build`
- Start the MCP `pnpm run start`
- Use the MCP serve to `http://localhost:5555/mcp`
  - Send in heders:
    - `email-username`: Your email address.
    - `email-password`: Your email app password.
    - `email-port`: The port for the IMAP server (default is 993).
    - `email-client-type`: The type of email client (default is 'gmail').


## Future work

I'll be working on:
- Improving the email summarization logic.
- Adding more filters and options for email retrieval.
- Allow fetch whole body information of the email (text, HTML, attachments, etc.).
- Allow execute action as marking emails as read, deleting, etc.
- Add support for multi email accounts. Maybe change the env vars to an array of objects with user and app password.
- Allow override default prompt for the summarization.
