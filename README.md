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
1. Ensure you have the required environment variables set up in your `.zshrc` or equivalent shell configuration file.
2. Add the MCP to your LLM agent of your preference (follow the specific instructions for your LLM, framework or app).
3. Use the MCP to fetch emails by providing the necessary parameters such as mailbox, subject, and date range in natural language.
4. The MCP will return a summary of the emails that match the criteria.
5. Enjoy it!


## Future work

I'll be working on:
- Improving the email summarization logic.
- Adding more filters and options for email retrieval.
- Allow fetch whole body information of the email (text, HTML, attachments, etc.).
- Allow execute action as marking emails as read, deleting, etc.
- Add support for multi email accounts. Maybe change the env vars to an array of objects with user and app password.
- Allow override default prompt for the summarization.
