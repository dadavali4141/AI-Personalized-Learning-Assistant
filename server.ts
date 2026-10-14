import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize Google GenAI if API key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health and AI capability status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    aiEnabled: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// AI Tutor chat endpoint
app.post('/api/tutor/chat', async (req: Request, res: Response) => {
  if (!aiClient) {
    res.status(503).json({
      error: 'AI Tutor service is not configured. Please ensure GEMINI_API_KEY is configured in your environment secrets.',
      fallbackAvailable: true,
    });
    return;
  }

  const { message, subject, context, studentLevel } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message text is required.' });
    return;
  }

  try {
    const systemPrompt = `You are "LearnAI Tutor", an expert, patient, and encouraging personal computer science and engineering mentor dedicated to UN Sustainable Development Goal 4: Quality Education.
Current subject context: ${subject || 'Computer Science & Programming'}.
Target student level: ${studentLevel || 'Undergraduate / College'}.

Guidelines:
1. Explain technical concepts in clear, direct, and accessible terms.
2. When answering programming or technical questions, provide small, well-commented code snippets.
3. Structure your explanations with:
   - Quick Summary
   - Step-by-step breakdown
   - Real-world / concrete analogy
   - Quick concept check question or takeaway
4. Keep the tone warm, constructive, academic yet approachable.
5. If the student made a mistake, gently explain why the misconception happens and how to think about it correctly.`;

    const contents = context 
      ? `Student context:\n${JSON.stringify(context, null, 2)}\n\nStudent question:\n${message}`
      : message;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || 'I could not generate an answer right now. Please try again.',
      subject: subject || 'General',
    });
  } catch (error: any) {
    console.error('AI Tutor error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response from AI Tutor.',
    });
  }
});

// AI Quiz Explanation endpoint
app.post('/api/tutor/quiz-explain', async (req: Request, res: Response) => {
  if (!aiClient) {
    res.status(503).json({
      error: 'AI service unavailable.',
      fallbackAvailable: true,
    });
    return;
  }

  const { question, options, selectedAnswer, correctAnswer, explanation, subject } = req.body;

  try {
    const prompt = `A student answered a quiz question and needs an AI Tutor explanation.
Subject: ${subject}
Question: ${question}
Options: ${JSON.stringify(options)}
Student selected: ${selectedAnswer}
Correct answer: ${correctAnswer}
Standard explanation: ${explanation}

Please provide:
1. Why the student's answer was incorrect or correct.
2. The core principle tested by this question.
3. A memorable mnemonic or mental model to never forget this concept.
Keep it under 150 words, concise, encouraging and directly educational.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an educational AI tutor explaining quiz answers concisely.',
        temperature: 0.6,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI quiz-explain error:', error);
    res.status(500).json({ error: error.message || 'Failed to explain quiz question.' });
  }
});

// AI Concept Deep Dive generator
app.post('/api/tutor/explain-topic', async (req: Request, res: Response) => {
  if (!aiClient) {
    res.status(503).json({
      error: 'AI service unavailable.',
      fallbackAvailable: true,
    });
    return;
  }

  const { subject, topic, level } = req.body;

  try {
    const prompt = `Provide an educational deep dive for a student studying ${subject}, specifically topic: "${topic}" at ${level || 'Intermediate'} difficulty.
Include:
- Key definition
- 3 core principles
- A code or architectural example
- Common pitfalls to avoid in exams or interviews`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert computer science instructor.',
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI explain-topic error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate topic explanation.' });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnAI server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
