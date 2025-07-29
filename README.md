# Email Summarizer

This project is designed to summarize emails using a custom IMAP client to connect to the user's email inbox and retrieve relevant messages based on specified criteria.

## Features
- Connects to an IMAP server to fetch emails.
- Can filter emails by:
  - Subject
  - Date range
  - Sender email address
  - Mailbox (default is 'INBOX')
  
## Debug
- Stdio: If you run this server in STDIO mode, all logs are saved in `server.log` file, in the location where you run the command. You can change this, setting the `DEBUG_LOG_FILE` environment variable to a custom path (absolute path).
- Docker: this mode use STDIO mode, so all logs are saved in `server.log` file, in the location where you run the command. You can change this, setting the `DEBUG_LOG_FILE` environment variable to a custom path (absolute path).
- Stream: If you run this server in stream mode, all logs are printed to the console.

## Available Tools

- `search-emails`: Get emails from the user's inbox.
- `mark-emails-as-read`: Mark specified emails as read.

## Usage

### Command (NPM)
1. Install dependencies `pnpm install -g @cardor/email-summarizer`
2. Add the configuration to your app client.
```json
"email-summarizer": {
  "type": "stdio", // Maybe your client MCP require specific type, like 'stdio'
  "command": "cardor-email-summarizer",
  "env": {
    // Your email address.
    "EMAIL_USERNAME": "<your-email>", 
    // Your email app password.
    "EMAIL_PASSWORD": "<your-app-password>",
    // The port for the IMAP server (default is 993).
    "EMAIL_PORT": "993",  
    // The type of email client: gmail, outlook, yahoo, etc (default is 'gmail').
    "EMAIL_CLIENT_TYPE": "gmail", 
    // Custom prompt for summarization. Must include `{{emails}}` to insert the email content.
    "EMAIL_PROMPT": "Summarize the following emails: {{emails}}", 
    // You can also use a file path to load the prompt content. You must use absolute path.
    // The file types supported are: .txt, .md, .json or .pdf.
    // "EMAIL_PROMPT": "file:/Absolute/Path/To/Prompt.txt"
    // Also you can define a URL to load the prompt content. The URL must return a text content.
    // The file types supported are: .txt, .md, .json or .pdf.
    // "EMAIL_PROMPT": "https://example.com/path/to/prompt.txt"
  }
}
```

### Command (With Docker)
1. Clone the repository `git clone <repository-url>`
2. Build the Docker image `pnpm run docker:build`
3. Add the configuration to your app client.
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
    "-e",
    "EMAIL_PORT=993",
    "-e",
    "EMAIL_CLIENT_TYPE=gmail",
    "-e",
    // Custom prompt for summarization. Must include `{{emails}}` to insert the email content.
    // As above, you can use a file path or a URL.
    "EMAIL_PROMPT=Summarize the following emails: {{emails}}", 
    "email-summarizer",
  ]
}
```

### Stream HTTP requests
You can also use the HTTP API to interact with the email summarizer. The API expects the following headers:
1. Clone the repository `git clone <repository-url>`
2. Install dependencies `pnpm install`
3. Build the MCP `pnpm run build`
4. Start the MCP `pnpm run start`
5. Use the MCP serve to `http://localhost:5555/mcp`
  - Send in headers:
    - `email-username`: Your email address.
    - `email-password`: Your email app password.
    - `email-port`: The port for the IMAP server (default is 993).
    - `email-client-type`: The type of email client (default is 'gmail').
    - `email-prompt`: Custom prompt for summarization (default is 'Summarize the following emails: {{emails}}'). Must include `{{emails}}` to insert the email content. As above, you can use a file path or a URL.


## Future work

I'll be working on:
- [x] Allow execute action as marking emails as read, deleting, etc.
- [x] Allow override default prompt for the summarization.
- [ ] Adding more filters and options for email retrieval.
- [ ] Allow fetch whole body information of the email (text, HTML, attachments, etc.).
