import * as dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

const template = "I will provide tasks to be performed on my system. Generate the corresponding commands or scripts to execute them. Only include the script or command in your response. Here's the task: {task}";
const promptTemplate = new PromptTemplate({
    template,
    inputVariables:["task"],
});

const formattedPrompt = await promptTemplate.format({
    task:"list the .txt files in the current directory and show its contents"
})

console.log(formattedPrompt);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  maxOutputTokens: 2048,
  temperature: 0.7,
});

// Batch and stream are also supported
const res = await model.invoke([
  [
    "human",
    formattedPrompt
  ],
]);

console.log(res.content);