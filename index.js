import * as dotenv from "dotenv";
dotenv.config();

import { PromptTemplate } from "@langchain/core/prompts";
import inquirer from "inquirer";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";

function displayBanner() {
  return new Promise((resolve) => {
    figlet(
      "LUNA",
      {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      },
      function (err, data) {
        if (err) {
          console.log(chalk.red("Something went wrong with the banner..."));
          resolve();
          return;
        }
        console.log(gradient.pastel.multiline(data));
        console.log("\n");
        resolve();
      }
    );
  });
}

// const model = new ChatOllama({
//   model: "codeqwen:latest", // Default value.
// });

// Initialize the AI model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash-8b",
  maxOutputTokens: 2048,
  temperature: 0.7,
});

// Create prompt template
const template = `Generate exactly ONE Linux bash terminal command that:
1. Performs the requested task OR provides a clear error message
2. Checks for required file existence in current directory when relevant
3. Follows all previous constraints
4. Output ONLY THE RAW COMMAND ITSELF
5. NO EXPLANATIONS, COMMENTS, OR FORMATTING
6. NO BACKTICKS, QUOTES, OR SPECIAL CHARACTERS
7. MUST WORK IN STANDARD BASH 5.0+ ENVIRONMENTS
8. PRIORITIZE CORE UTILS OVER NON-STANDARD PACKAGES

STRICT FORMAT RULES:
- Single line command only
- Use test/[ ] for file checks
- Error format: "Error: <message>" if validation fails
- No nested logic (if/else blocks)
- Pipe operators allowed

Task: {task}

Command:`;
const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["task"],
});

async function generateCommand(task) {
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

// Add exit handler function
function handleExit() {
  console.log("\n"); // Add newline for cleaner output
  const rainbow = chalkAnimation.rainbow("Thanks for using LUNA! Goodbye!");

  // Stop the animation after 2 seconds and exit
  setTimeout(() => {
    rainbow.stop();
    process.exit(0);
  }, 2000);
}

// Add SIGINT handler at the top level
process.on("SIGINT", handleExit);

// Main application flow
async function main() {
  try {
    await displayBanner();

    while (true) {
      // Continue running until user exits
      const questions = [
        {
          type: "input",
          name: "task",
          message: chalk.blue("What system task would you like to perform?"),
          validate: (input) => input.trim().length > 0 || "Please enter a task",
        },
      ];

      const { task } = await inquirer.prompt(questions);
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
        const { exec } = await import("child_process");
        await new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(
                chalk.red(`Error executing command: ${error.message}`)
              );
            }
            if (stderr) {
              console.error(chalk.yellow(`Command stderr: ${stderr}`));
            }
            if (stdout) {
              console.log(chalk.green(`Command output:\n${stdout}`));
            }
            resolve();
          });
        });
      } else {
        console.log(chalk.gray("Command execution cancelled."));
      }

      const { shouldContinue } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldContinue",
          message: chalk.blue("Would you like to perform another task?"),
          default: true,
        },
      ]);

      if (!shouldContinue) {
        handleExit();
        break;
      }

      console.log("\n" + chalk.cyan("─".repeat(50)) + "\n"); // Add a separator line
    }
  } catch (error) {
    console.error(chalk.red("An error occurred:"), error);
    handleExit();
  }
}

main();

// Handle close event
