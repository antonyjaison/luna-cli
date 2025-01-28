import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { template } from "./prompt.js";
import inquirer from "inquirer";
import chalk from "chalk";
import markdownToCli from "cli-markdown"

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

export async function generateAssjstanceText(task) {
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

export async function handleAssistance() {
    const { task } = await inquirer.prompt([
        {
            type: "input",
            name: "task",
            message: chalk.blue("What system assistance do you want?"),
            validate: (input) => input.trim().length > 0 || "Please enter a task",
        },
    ]);

    const assistanceText = await generateAssjstanceText(task);

    console.log(chalk.green("\nHere's a quick read on your query:"));
    console.log(markdownToCli(assistanceText));
}