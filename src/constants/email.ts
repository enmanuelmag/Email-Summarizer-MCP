export const FETCH_EMAILS_PROMPT = `
Please summarize the following emails in a table format, the columns should include:
- Subject
- Sender
- Date
- Snippet

Only show at most 6 emails in the table. Just mention a short description about emails that was not listed on the table and mention the total count. Here are the emails:
{{emails}}
`;
