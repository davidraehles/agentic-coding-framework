import LLMClient from './llm-client.js';
import DIRECTORS from './directors.js';

class BoardMeeting {
  constructor() {
    this.llm = new LLMClient();
    this.directors = Object.values(DIRECTORS);
  }

  async conductMeeting(topic) {
    console.log(`\n📢 Board Meeting Called: "${topic}"\n`);

    // Phase 1: Proposal Generation
    console.log("Phase 1: Generating Proposals...");
    const proposals = await this.generateProposals(topic);

    // Phase 2: Anonymization
    console.log("Phase 2: Anonymizing Proposals...");
    const anonymizedProposals = this.anonymizeProposals(proposals);

    // Phase 3: Voting
    console.log("Phase 3: Voting...");
    const votes = await this.collectVotes(topic, anonymizedProposals);

    // Phase 4: Tally
    const result = this.tallyVotes(votes, anonymizedProposals);

    return result;
  }

  async generateProposals(topic) {
    const proposalPromises = this.directors.map(async (director) => {
      try {
        console.log(`   - ${director.name} is thinking...`);
        const response = await this.llm.complete(
          director.systemPrompt,
          `Please provide your perspective and a concrete proposal on the following topic:\n"${topic}"\nKeep your response concise (under 200 words).`
        );
        return { director: director.name, content: response };
      } catch (error) {
        console.error(`Error from ${director.name}:`, error.message);
        return { director: director.name, content: "Abstained due to technical difficulties." };
      }
    });

    return Promise.all(proposalPromises);
  }

  anonymizeProposals(proposals) {
    return proposals.map((p, index) => ({
      id: String.fromCharCode(65 + index), // A, B, C, D, E
      originalDirector: p.director,
      content: p.content
    }));
  }

  async collectVotes(topic, anonymizedProposals) {
    // Format proposals for reading
    const proposalsText = anonymizedProposals
      .map(p => `Proposal ${p.id}:\n${p.content}\n---`)
      .join('\n');

    const votePromises = this.directors.map(async (director) => {
      try {
        // Find their own proposal ID to exclude (optional, but good for fairness)
        const ownProposal = anonymizedProposals.find(p => p.originalDirector === director.name);
        const ownId = ownProposal ? ownProposal.id : null;

        const prompt = `
Topic: "${topic}"

Here are 5 anonymous proposals from the board:

${proposalsText}

Your Task:
1. Evaluate these proposals based on your core values (${director.role}).
2. Vote for the single best proposal.
3. You CANNOT vote for Proposal ${ownId} (which is your own).
4. Provide a brief 1-sentence reason.

Format your response exactly like this:
VOTE: [Proposal ID]
REASON: [Your reason]
`;
        console.log(`   - ${director.name} is voting...`);
        const response = await this.llm.complete(director.systemPrompt, prompt);
        return this.parseVote(response, director.name);
      } catch (error) {
         console.error(`Error collecting vote from ${director.name}:`, error.message);
         return null;
      }
    });

    return Promise.all(votePromises);
  }

  parseVote(response, voterName) {
    const voteMatch = response.match(/VOTE:\s*([A-E])/i);
    const reasonMatch = response.match(/REASON:\s*(.*)/i);

    return {
      voter: voterName,
      choice: voteMatch ? voteMatch[1].toUpperCase() : null,
      reason: reasonMatch ? reasonMatch[1] : "No reason provided."
    };
  }

  tallyVotes(votes, anonymizedProposals) {
    const validVotes = votes.filter(v => v && v.choice);
    const scores = {};

    // Initialize scores
    anonymizedProposals.forEach(p => scores[p.id] = 0);

    // Tally
    validVotes.forEach(v => {
      if (scores[v.choice] !== undefined) {
        scores[v.choice]++;
      }
    });

    // Find winner
    let maxScore = -1;
    let winnerId = null;

    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winnerId = id;
      }
    });

    const winner = anonymizedProposals.find(p => p.id === winnerId);

    return {
      topic: "",
      winner: winner,
      scores: scores,
      votes: validVotes,
      proposals: anonymizedProposals
    };
  }
}

export default BoardMeeting;
