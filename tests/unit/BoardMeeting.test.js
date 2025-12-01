import { jest } from '@jest/globals';
import BoardMeeting from '../../lib/consensus/board-meeting.js';
import LLMClient from '../../lib/consensus/llm-client.js';

// Mock LLMClient
jest.mock('../../lib/consensus/llm-client.js');

describe('BoardMeeting', () => {
  let meeting;
  let mockLLM;

  beforeEach(() => {
    // Setup mock implementation
    mockLLM = {
      complete: jest.fn()
    };

    // In ESM mocking with Jest, we might need to handle the mock differently
    // if LLMClient is the default export.
    // However, since we are mocking the module, we assume the constructor calls will rely on the mocked class.

    // For this specific test, we can just spy on the methods or ensure the class is mocked correctly.
    // Given the error "mockClear is not a function", it seems LLMClient isn't being treated as a Jest mock function automatically in this ESM context.

    // Workaround: Mock the instance method on the prototype if strict mocking fails
    // But better: Use the mocked module instance.
  });

  test('generateProposals should call LLM for each director', async () => {
    // Manually injecting mock into the meeting instance for this test
    // to bypass module mocking complexity in ESM/Jest for now.
    meeting = new BoardMeeting();
    meeting.llm = mockLLM;
    mockLLM.complete.mockResolvedValue('A proposal');

    const proposals = await meeting.generateProposals('Topic');

    expect(proposals.length).toBe(5);
    expect(mockLLM.complete).toHaveBeenCalledTimes(5);
    expect(proposals[0].content).toBe('A proposal');
  });

  test('anonymizeProposals should assign IDs', () => {
    meeting = new BoardMeeting();
    const proposals = [
      { director: 'Dir 1', content: 'Content 1' },
      { director: 'Dir 2', content: 'Content 2' }
    ];

    const result = meeting.anonymizeProposals(proposals);

    expect(result[0].id).toBe('A');
    expect(result[1].id).toBe('B');
    expect(result[0].originalDirector).toBe('Dir 1');
  });

  test('tallyVotes should determine the winner', () => {
    meeting = new BoardMeeting();
    const anonymizedProposals = [
      { id: 'A', originalDirector: 'Dir 1', content: 'Content 1' },
      { id: 'B', originalDirector: 'Dir 2', content: 'Content 2' }
    ];

    const votes = [
      { voter: 'Voter 1', choice: 'A', reason: 'Good' },
      { voter: 'Voter 2', choice: 'A', reason: 'Better' },
      { voter: 'Voter 3', choice: 'B', reason: 'Okay' }
    ];

    const result = meeting.tallyVotes(votes, anonymizedProposals);

    expect(result.winner.id).toBe('A');
    expect(result.scores['A']).toBe(2);
    expect(result.scores['B']).toBe(1);
  });
});
