import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { emailTemplate } from "./prompt.js";
import inquirer from "inquirer";
import chalk from "chalk";
import { executeCommand } from "./executeCommand.js";
import { user } from "./user.js";
import markdownToCli from "cli-markdown";
import { createSpinner } from "nanospinner";

const spinner = createSpinner();

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
        spinner.start({ text: "Generating email..." });
        const formattedPromptSub = await promptEmailTemplate.format({
            task,
            sender_name: user.name
        });
        const res = await model.invoke([["human", formattedPromptSub]]);
        const cleanedContent = res.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        spinner.success({ text: "Email generated" });

        try {
            spinner.start({ text: "Parsing email content..." });
            const emailData = JSON.parse(cleanedContent); 
            spinner.success({ text: "Email content parsed" });
            return emailData
        } catch (error) {
            spinner.error({ text: "Failed to parse email content" });
            return "Failed to generate email command. Invalid JSON format.";
        }

    } catch (error) {
        console.error(chalk.red("Error generating email:"), error);
        return "Failed to generate email. Please try again.";
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
    console.log(command)
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

    const { recipientEmail } = await inquirer.prompt([
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
            spinner.start({ text: "Executing email command..." });
            const output = await executeCommand(recipientEmail, command.subject, command.body);
            spinner.success({ text: "Email command executed successfully" });
            console.log(chalk.green("Email command executed successfully:"));
            console.log(output);
        } catch (error) {
            spinner.error({ text: "Failed to execute email command" });
            console.error(chalk.red(`Error executing email command: ${error.message}`));
        }
    } else {
        console.info(chalk.blue("Command execution cancelled."));
    }
}


// send an email to my professor that i am on leave today, i am not feeling good today, my professor email id is antonyjaison456@gmail.com