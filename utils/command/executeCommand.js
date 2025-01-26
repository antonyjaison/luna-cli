import { exec } from "child_process";
import tmp from "tmp";
import fs from "fs";

/**
 * Execute a single command.
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} - The output of the command.
 */
export function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`Command stderr: ${stderr}`);
                return reject(new Error(stderr));
            }
            resolve(stdout);
        });
    });
}

/**
 * Execute a multi-line script.
 * @param {string} scriptContent - The content of the script to execute.
 * @returns {Promise<string>} - The output of the script.
 */
export function executeScript(scriptContent) {
    return new Promise((resolve, reject) => {
        // Create a temporary file to store the script
        tmp.file({ postfix: ".sh" }, (err, path, fd, cleanupCallback) => {
            if (err) {
                console.error(`Error creating temporary file: ${err.message}`);
                return reject(err);
            }

            // Write the script content to the temporary file
            fs.writeFileSync(path, scriptContent);
            fs.chmodSync(path, 0o755); // Make the script executable

            // Execute the script
            exec(`bash ${path}`, (error, stdout, stderr) => {
                cleanupCallback(); // Clean up the temporary file
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    return reject(error);
                }
                if (stderr) {
                    console.warn(`Script stderr: ${stderr}`);
                    return reject(new Error(stderr));
                }
                resolve(stdout);
            });
        });
    });
}