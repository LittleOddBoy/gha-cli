import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";

// Initialize the CLI program
const program = new Command();

program
  .name("gha")
  .description("A simple CLI tool to fetch GitHub data")
  .version("1.0.0");

// Updated options
const options = ["Fetch user data by username", "Exit"];

// Regex to validate GitHub username
const usernameRegex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;

// Function to prompt user with the two options
async function promptUser() {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: options,
    },
  ]);

  if (answer.action === "Fetch user data by username") {
    promptForUsername();
  } else {
    console.log(chalk.yellow("Goodbye!"));
    process.exit(0);
  }
}

// Function to prompt for a valid GitHub username
async function promptForUsername() {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Enter the GitHub username:",
      validate: (input) => {
        // Validate username based on GitHub's rules: 1-39 chars, alphanumeric or hyphen, no trailing hyphen
        if (input.length > 39 || input.length === 0) {
          return "Username must be between 1 and 39 characters long.";
        }
        if (!usernameRegex.test(input)) {
          return "Invalid username. Only alphanumeric characters and hyphens are allowed.";
        }
        return true;
      },
    },
  ]);

  // Fetch data from GitHub API after validating the username
  await fetchUserEvents(answer.username);
}

// Function to fetch recent GitHub user events using fetch()
async function fetchUserEvents(username: string) {
  const url = `https://api.github.com/users/${username}/events`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "node.js", // GitHub API requires User-Agent header
      },
    });

    if (!response.ok) {
      console.log(
        chalk.red(
          "Failed to fetch data. Please check the username or try again later."
        )
      );
      return;
    }

    const events = await response.json();

    // Handle the case where no events are returned
    if (!Array.isArray(events) || events.length === 0) {
      console.log(chalk.red("No recent activity found for this user."));
      return;
    }

    // Display the 3 most recent events with better formatting
    console.log(
      chalk.green(`\nRecent activity for GitHub user: ${chalk.bold(username)}`)
    );
    console.log(chalk.green("--------------------------------------------"));

    events.slice(0, 3).forEach((event, index) => {
      console.log(chalk.cyan.bold(`\nActivity #${index + 1}`));
      console.log(
        chalk.yellow("Event Type:") + ` ${chalk.white.bold(event.type)}`
      );
      console.log(
        chalk.yellow("Repository:") + ` ${chalk.white.bold(event.repo.name)}`
      );
      console.log(
        chalk.yellow("Date:") +
          ` ${chalk.white.bold(new Date(event.created_at).toLocaleString())}`
      );
      console.log(chalk.green("--------------------------------------------"));
    });
    console.log(chalk.yellow(`and ${events.length - 3} more activities...`));
  } catch (error: any) {
    console.log(chalk.red(`Error fetching data: ${error.message}`));
  }
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
