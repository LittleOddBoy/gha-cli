import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import https from "https"; // Node.js built-in module for making HTTP requests

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
  fetchUserEvents(answer.username);
}

// Function to fetch recent GitHub user events
function fetchUserEvents(username: string) {
  const options = {
    hostname: "api.github.com",
    path: `/users/${username}/events`,
    method: "GET",
    headers: { "User-Agent": "node.js" }, // GitHub API requires User-Agent header
  };

  https
    .get(options, (res) => {
      let data = "";

      // Accumulate the chunks of data received
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Once the response has ended, parse and display the recent activity
      res.on("end", () => {
        try {
          const events = JSON.parse(data);

          // Handle the case where no events are returned
          if (!Array.isArray(events) || events.length === 0) {
            console.log(chalk.red("No recent activity found for this user."));
            return;
          }

          // Display the 3 most recent events
          console.log(chalk.green(`Recent activity for user: ${username}`));
          events.slice(0, 3).forEach((event, index) => {
            console.log(`\nActivity ${index + 1}:`);
            console.log(`  Type: ${chalk.blue(event.type)}`);
            console.log(`  Repo: ${chalk.blue(event.repo.name)}`);
            console.log(
              `  Date: ${chalk.blue(
                new Date(event.created_at).toLocaleString()
              )}`
            );
          });
        } catch (error) {
          console.log(
            chalk.red("Error parsing the response. Please try again.")
          );
        }
      });
    })
    .on("error", (err) => {
      console.log(chalk.red(`Error fetching data: ${err.message}`));
    });
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
