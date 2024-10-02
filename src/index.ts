import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";

// Initialize the CLI program
const program = new Command();

program
  .name("gha")
  .description("A simple CLI tool to fetch GitHub data")
  .version("1.0.0");

// Dummy options for now
const options = [
  "Option 1: Fetch repositories",
  "Option 2: Fetch followers",
  "Option 3: Exit",
];

// Function to prompt user with dummy options
async function promptUser() {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: options,
    },
  ]);

  // Simple feedback logic
  console.log(chalk.green(`You selected: ${answer.action}`));
}

// Define the CLI command that triggers the prompt
program
  .command("start")
  .description("Start the CLI tool")
  .action(() => {
    console.log(chalk.blue("Welcome to the GHA CLI tool!"));
    promptUser();
  });

// Parse the CLI arguments
program.parse(process.argv);
