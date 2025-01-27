import * as dotenv from "dotenv";
dotenv.config();

import inquirer from "inquirer";
import chalk from "chalk";
import { displayBanner } from "./utils/banner.js";
import { handleExit } from "./utils/exit.js";
import { handleCommand } from "./utils/command/command.js";
import { handleAssistance } from "./utils/assistance/assistance.js";
import { handleEmailCommand } from "./utils/email/command.js";


// Add SIGINT handler at the top level
process.on("SIGINT", handleExit);

// Main application flow
async function main() {
  try {
    await displayBanner();

    while (true) {
      // Display the main menu
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: chalk.blue("What would you like to do?"),
          choices: [
            { name: "Generate and execute a command", value: "command" },
            { name: "Send an email", value: "email" },
            { name: "Manage files", value: "file" },
            { name: "Get system assistance", value: "system" },
            { name: "Exit", value: "exit" },
          ],
        },
      ]);

      if (action === "exit") {
        handleExit();
        break;
      }

      // Handle the selected action
      switch (action) {
        case "command":
          await handleCommand();
          break;
        case "email":
          await handleEmailCommand();
          break;
        case "file":
          console.log("File management functionality coming soon!");
          break;
        case "system":
          await handleAssistance();
          break;
        default:
          console.warn("Invalid action selected.");
      }
``
      console.log("\n" + chalk.cyan("─".repeat(50)) + "\n"); // Add a separator line
    }
  } catch (error) {
    console.error("An error occurred:", error);
    handleExit();
  }
}

main();