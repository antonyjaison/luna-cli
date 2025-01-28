export const emailTemplate = `
    Generate a professional email in JSON format using the following details. Ensure the JSON includes the keys: subject, body, and recipient_email_id. Follow these guidelines:
    
    1. Extract the recipient_email_id from the provided task. Specify how the email should be extracted (e.g., look for an email pattern or a specific keyword).
    2. Use the sender_name and task details to craft a concise and professional email body and subject.
    3. Do not include any placeholders in the subject or body. All fields must be populated with actual data.
    
    Input Details:
    - Task: {task}
    - Sender Name: {sender_name}
    
    Expected JSON Output Format:
        "subject": "Example Subject",
        "body": "Example email body content.",
        "recipient_email_id": "example@domain.com"
`;