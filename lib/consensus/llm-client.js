import { spawn } from 'child_process';

/**
 * Lightweight wrapper to call an LLM.
 * Since specific SDKs might not be installed, we'll try to use fetch if API keys are present.
 * If not, we'll warn the user.
 */
export class LLMClient {
  constructor() {
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.provider = this.anthropicKey ? 'anthropic' : (this.openaiKey ? 'openai' : null);
  }

  async complete(systemPrompt, userPrompt) {
    if (!this.provider) {
      throw new Error('No API keys found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
    }

    if (this.provider === 'anthropic') {
      return this.callAnthropic(systemPrompt, userPrompt);
    } else {
      return this.callOpenAI(systemPrompt, userPrompt);
    }
  }

  async callAnthropic(systemPrompt, userPrompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callOpenAI(systemPrompt, userPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default LLMClient;
