import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { emailTemplate } from "./prompt.js";
import inquirer from "inquirer";
import chalk from "chalk";
import { executeCommand } from "./executeCommand.js";
import { user } from "./user.js";
import markdownToCli from "cli-markdown";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: "AIzaSyCwvqa_fsHvrDOaRm6FqmmqeckeW6mvXO0", // Ensure this API key is valid and secure.
});

const promptEmailTemplate = new PromptTemplate({
    template: emailTemplate,
    inputVariables: ["task", "sender_name"],
})

export async function generateEmailCommand(task) {
    try {
        const formattedPromptSub = await promptEmailTemplate.format({
            task,
            sender_name: user.name
        });
        const res = await model.invoke([["human", formattedPromptSub]]);
        const cleanedContent = res.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        try {
            const emailData = JSON.parse(cleanedContent); // Parse the JSON string
            return emailData
        } catch (error) {
            console.error(chalk.red("Error parsing email content as JSON:"), error);
            return "Failed to generate email command. Invalid JSON format.";
        }

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

    const command = await generateEmailCommand(task);
    console.log(chalk.green("\nGenerated email content:"));
    console.log(chalk.yellow(`Subject: ${command.subject}`));
    console.log(markdownToCli(command.body));

    const { shouldExecute } = await inquirer.prompt([
        {
            type: "confirm",
            name: "shouldExecute",
            message: chalk.blue("Do you want to execute this email command?"),
            default: false,
        },
    ]);

    const { recipient_email } = await inquirer.prompt([
        {
            type: "input",
            name: "recipientEmail",
            message: chalk.blue("Enter recipient email address:"),
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Please enter a valid email address",
        },
    ]);


    if (shouldExecute) {
        try {
            const output = await executeCommand(recipient_email, command.subject, command.body);
            console.log(chalk.green("Email command executed successfully:"));
            console.log(output);
        } catch (error) {
            console.error(chalk.red(`Error executing email command: ${error.message}`));
        }
    } else {
        console.info(chalk.blue("Command execution cancelled."));
    }
}


// send an email to my professor that i am on leave today, i am not feeling good today, my professor email id is antonyjaison456@gmail.com