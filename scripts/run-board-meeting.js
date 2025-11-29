#!/usr/bin/env node

import BoardMeeting from '../lib/consensus/board-meeting.js';
import readline from 'readline';

async function main() {
  const args = process.argv.slice(2);
  let topic = args.join(' ');

  if (!topic) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    topic = await new Promise(resolve => {
      rl.question('Enter the topic for the Board Meeting: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  if (!topic) {
    console.error("Error: Topic is required.");
    process.exit(1);
  }

  // Check for API keys
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable is required.");
    process.exit(1);
  }

  const meeting = new BoardMeeting();

  try {
    const result = await meeting.conductMeeting(topic);

    console.log("\n" + "=".repeat(50));
    console.log("🏁 MEETING ADJOURNED 🏁");
    console.log("=".repeat(50));

    if (result.winner) {
        console.log(`\n🏆 WINNER: Proposal ${result.winner.id} (by ${result.winner.originalDirector})`);
        console.log(`\n📄 THE WINNING PROPOSAL:\n${result.winner.content}`);
    } else {
        console.log("\n🏆 WINNER: None (No votes cast or tie with no votes)");
    }

    console.log("\n" + "-".repeat(50));
    console.log("📊 VOTE TALLY");
    console.log("-".repeat(50));

    // Sort scores
    const sortedScores = Object.entries(result.scores).sort((a, b) => b[1] - a[1]);

    sortedScores.forEach(([id, score]) => {
      const p = result.proposals.find(prop => prop.id === id);
      console.log(`Proposal ${id} (${p.originalDirector}): ${score} votes`);
    });

    console.log("\n" + "-".repeat(50));
    console.log("🗳️  VOTING RECORDS");
    console.log("-".repeat(50));

    result.votes.forEach(vote => {
        if (vote) {
            console.log(`${vote.voter} voted for ${vote.choice}`);
            console.log(`Reason: ${vote.reason}\n`);
        }
    });

  } catch (error) {
    console.error("Board meeting failed:", error);
    process.exit(1);
  }
}

main();
