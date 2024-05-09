import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import chalk from 'chalk';

// Convert __dirname to ES Module equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

// Define the path to the pkg folder
const pkgFolderPath = join(__dirname, 'warp-wasm', 'pkg');

// Function to prompt user for input
const askUser = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Check if the pkg folder exists
if (!existsSync(pkgFolderPath)) {
  console.error(chalk.red('Error: The "pkg" folder inside "warp-wasm" is missing. It is warp-wasm package.'));
  console.error(chalk.red('Please ensure the "pkg" folder is present before running the app.'));

  // Warn user and ask if they want to continue
  (async () => {
    const answer = await askUser(chalk.yellow('Warp functions will not work without the "pkg" folder. Do you want to continue? (y/n): '));
    if (answer.toLowerCase() !== 'y') {
      console.error(chalk.red('Exiting the process. Please add the "pkg" folder and try again.'));
      process.exit(1); // Exit the process with an error code
    } else {
      console.warn(chalk.yellow('Continuing without "pkg" folder. Warp functions will not be available.'));
      // You can add additional warnings or steps here if necessary
    }
  })();
} else {
  console.info(chalk.green('Pkg wasm-warp package found.'));
}
