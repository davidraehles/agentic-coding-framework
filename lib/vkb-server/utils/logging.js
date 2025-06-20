/**
 * Simple logging utility for VKB Server
 */

import chalk from 'chalk';

export class Logger {
  constructor(name) {
    this.name = name;
  }
  
  info(message) {
    console.log(chalk.blue(`[${this.name}]`), message);
  }
  
  warn(message) {
    console.log(chalk.yellow(`[${this.name}]`), chalk.yellow(message));
  }
  
  error(message) {
    console.error(chalk.red(`[${this.name}]`), chalk.red(message));
  }
  
  success(message) {
    console.log(chalk.green(`[${this.name}]`), chalk.green(message));
  }
}