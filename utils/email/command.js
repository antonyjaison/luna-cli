import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { subjectTemplate, bodyTemplate } from "./prompt.js";
import inquirer from "inquirer";
import chalk from "chalk";
import { executeCommand } from "./executeCommand.js";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: "AIzaSyCwvqa_fsHvrDOaRm6FqmmqeckeW6mvXO0", // Ensure this API key is valid and secure.
});

const promptSubjectTemplate = new PromptTemplate({
    template: subjectTemplate,
    inputVariables: ["task", "sender_email", "recipient_email"],
});

const promptBodyTemplate = new PromptTemplate({
    template: bodyTemplate,
    inputVariables: ["task", "sender_email", "recipient_email", "subject"],
});

export async function generateEmailCommand(task, senderEmail, recipientEmail) {
    try {
        const formattedPromptSub = await promptSubjectTemplate.format({
            task,
            sender_email: senderEmail,
            recipient_email: recipientEmail,
        });
        const res = await model.invoke([["human", formattedPromptSub]]);
        const cleanedContent = res.content.replace(/<think>.*?<\/think>/, "").trim();

        const formattedPromptBody = await promptBodyTemplate.format({
            task,
            sender_email: senderEmail,
            recipient_email: recipientEmail,
            subject: cleanedContent,
        });
        const resBody = await model.invoke([["human", formattedPromptBody]]);
        const cleanedContentBody = resBody.content.replace(/<think>.*?<\/think>/, "").trim();

        return {
            sub: cleanedContent,
            body: cleanedContentBody,
        };
    } catch (error) {
        console.error(chalk.red("Error generating email command:"), error);
        return "Failed to generate email command. Please try again.";
    }
}

export async function handleEmailCommand() {
    const { task } = await inquirer.prompt([
        {
            type: "input",
            name: "task",
            message: chalk.blue("What is the email task (e.g., 'leave letter')?"),
            validate: (input) => input.trim().length > 0 || "Please enter a task",
        },
    ]);

    const { senderEmail } = await inquirer.prompt([
        {
            type: "input",
            name: "senderEmail",
            message: chalk.blue("Enter sender email address:"),
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Please enter a valid email address",
        },
    ]);

    const { password } = await inquirer.prompt([
        {
            type: "password",
            name: "password",
            message: chalk.blue("Enter sender email password:"),
        },
    ]);

    const { recipientEmail } = await inquirer.prompt([
        {
            type: "input",
            name: "recipientEmail",
            message: chalk.blue("Enter recipient email address:"),
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Please enter a valid email address",
        },
    ]);

    const command = await generateEmailCommand(task, senderEmail, recipientEmail);

    console.log(chalk.green("\nGenerated email content:"));
    console.log(chalk.yellow(`Subject: ${command.sub}`));
    console.log(chalk.yellow(`Body: ${command.body}\n`));

    const { shouldExecute } = await inquirer.prompt([
        {
            type: "confirm",
            name: "shouldExecute",
            message: chalk.blue("Do you want to execute this email command?"),
            default: false,
        },
    ]);

    if (shouldExecute) {
        try {
            const output = await executeCommand(senderEmail, password, recipientEmail, command.sub, command.body);
            console.log(chalk.green("Email command executed successfully:"));
            console.log(output);
        } catch (error) {
            console.error(chalk.red(`Error executing email command: ${error.message}`));
        }
    } else {
        console.info(chalk.blue("Command execution cancelled."));
    }
}
