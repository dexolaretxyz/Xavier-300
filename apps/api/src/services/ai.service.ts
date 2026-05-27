import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

export interface AIRecommendation {
  topic: string;
  recommendation: string;
  priority: string;
}

export const aiService = {
  async generateRecommendations(weakTopics: { topic: string; score: number; total: number }[], certName: string): Promise<AIRecommendation[]> {
    if (!weakTopics || weakTopics.length === 0) {
      return [];
    }

    const topicsString = weakTopics.map(t => `${t.topic} (${t.score}%)`).join(', ');

    const prompt = `System: You are a study advisor for tech certification students.

A student just completed a ${certName} mock exam.
Weak areas (scored below 70%): ${topicsString}

For each weak area, recommend 1 specific study resource:
- Exact Microsoft Learn module name, or
- Specific documentation section, or
- Named book chapter

Return ONLY a JSON array with objects containing: { "topic": "...", "recommendation": "...", "priority": "High/Medium/Low" }. Be specific, not generic. Do not include markdown fences, just raw JSON.`;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const message = await anthropic.messages.create({
          max_tokens: 1024,
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: prompt }]
        });

        const textResponse = (message.content[0] as any).text;
        
        // Strip possible markdown JSON fences if the model adds them despite instructions
        let cleanJson = textResponse.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        cleanJson = cleanJson.trim();

        return JSON.parse(cleanJson);
      } else {
        // Mock response if no API key is provided
        return weakTopics.map((t, i) => ({
          topic: t.topic,
          recommendation: `Read official documentation chapter for ${t.topic} to improve your ${t.score}% score.`,
          priority: t.score < 50 ? 'High' : 'Medium'
        }));
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations', error);
      // Fallback
      return weakTopics.map(t => ({
        topic: t.topic,
        recommendation: `Review ${t.topic} fundamentals.`,
        priority: 'Medium'
      }));
    }
  }
};
