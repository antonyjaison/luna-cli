import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { template } from "./prompt.js";
import inquirer from "inquirer";
import chalk from "chalk";
import { executeCommand, executeScript } from "./executeCommand.js";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: "AIzaSyCwvqa_fsHvrDOaRm6FqmmqeckeW6mvXO0",
});


const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["task"],
});

export async function generateCommand(task) {
    try {
        const formattedPrompt = await promptTemplate.format({ task });
        const res = await model.invoke([["human", formattedPrompt]]);
        const cleanedContent = res.content.replace(/<think>.*?<\/think>/, "");
        return cleanedContent;
    } catch (error) {
        console.error(chalk.red("Error generating command:"), error);
        return "Failed to generate command. Please try again.";
    }
}

export async function handleCommand() {
    const { task } = await inquirer.prompt([
        {
            type: "input",
            name: "task",
            message: chalk.blue("What system task would you like to perform?"),
            validate: (input) => input.trim().length > 0 || "Please enter a task",
        },
    ]);

    const command = await generateCommand(task);

    console.log(chalk.green("\nGenerated command:"));
    console.log(chalk.yellow(command + "\n"));

    const { shouldExecute } = await inquirer.prompt([
        {
            type: "confirm",
            name: "shouldExecute",
            message: chalk.blue("Do you want to execute this command?"),
            default: false,
        },
    ]);

    if (shouldExecute) {
        try {
            if (command.includes("\n") || command.startsWith("#!")) {
                // If the command is a script, execute it as a script
                const output = await executeScript(command);
                console.log(chalk.green("Script executed successfully:"));
                console.log(output);
            } else {
                // If the command is a single command, execute it directly
                const output = await executeCommand(command);
                console.log(chalk.green("Command executed successfully:"));
                console.log(output);
            }
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
        }
    } else {
        console.info("Command execution cancelled.");
    }
}