import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/db';

export const questionService = {
  
  /**
   * Generates questions using Anthropic Claude API and saves them as PENDING_REVIEW
   */
  async generateQuestionsWithAI(certId: string, topic: string, count: number, difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED' = 'MEDIUM') {
    const certification = await prisma.certification.findUnique({ where: { id: certId } });
    if (!certification) throw new Error('Certification not found');

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
    
    let generatedQuestions: any[] = [];

    // Fallback if no API key is provided
    if (!ANTHROPIC_API_KEY) {
      console.warn('⚠️ No ANTHROPIC_API_KEY found. Generating dummy questions.');
      for (let i = 0; i < count; i++) {
        generatedQuestions.push({
          text: `[DUMMY] What is a key concept of ${topic} in ${certification.name}?`,
          options: {
            A: "Option A (Correct)",
            B: "Option B",
            C: "Option C",
            D: "Option D"
          },
          correctAnswer: "A",
          explanation: `This is a dummy generated explanation for ${topic}.`,
          difficulty,
          topic
        });
      }
    } else {
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      
      const prompt = `
        You are an expert examiner for the certification: ${certification.name}.
        Generate ${count} multiple choice questions about the topic: "${topic}".
        The difficulty level should be ${difficulty}.
        
        Respond ONLY with a raw JSON array of objects. Do not include markdown formatting, fences (\`\`\`), or any introductory text.
        Each object must strictly follow this structure:
        {
          "text": "The question text",
          "options": {
            "A": "First option",
            "B": "Second option",
            "C": "Third option",
            "D": "Fourth option"
          },
          "correctAnswer": "A", // Or B, C, D
          "explanation": "Detailed explanation of why the answer is correct.",
          "difficulty": "${difficulty}",
          "topic": "${topic}"
        }
      `;

      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4000,
          temperature: 0.2,
          system: "You are a JSON-only API. You output raw JSON arrays and nothing else.",
          messages: [{ role: 'user', content: prompt }]
        });

        let rawContent = (response.content[0] as any).text;
        
        // Clean markdown fences if Claude accidentally includes them
        if (rawContent.startsWith('```json')) {
          rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '');
        } else if (rawContent.startsWith('```')) {
          rawContent = rawContent.replace(/^```/, '').replace(/```$/, '');
        }

        generatedQuestions = JSON.parse(rawContent.trim());
      } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error('Failed to generate questions with AI.');
      }
    }

    // Insert the generated questions into the database
    const createPromises = generatedQuestions.map(q => 
      prisma.question.create({
        data: {
          certificationId: certId,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topic: q.topic,
          source: 'AI',
          status: 'PENDING_REVIEW'
        }
      })
    );

    await Promise.all(createPromises);
    return generatedQuestions.length;
  },

  /**
   * Fetches only approved questions for a given certification
   */
  async getApprovedQuestions(certId: string) {
    return prisma.question.findMany({
      where: {
        certificationId: certId,
        status: 'APPROVED'
      }
    });
  },

  /**
   * Randomly shuffles and selects N items (Fisher-Yates)
   */
  getRandomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
};
