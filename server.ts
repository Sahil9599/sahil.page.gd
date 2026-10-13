import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, role = 'general', taskComplexity = 'general' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Model selection based on requirements:
    // Use gemini-3.1-pro-preview for particularly complex tasks,
    // gemini-3.5-flash for general tasks,
    // and gemini-3.1-flash-lite for tasks that should happen fast.
    let modelName = 'gemini-3.5-flash';
    if (taskComplexity === 'complex') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (taskComplexity === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    }

    let systemInstruction = `You are the official Cyber AI Assistant for Zarki (Sahil)'s Portfolio website (sahil.page.gd).
Key details about Zarki:
- Name: Zarki (Sahil), Cybersecurity Student, Class of 2026, based in India.
- Email: zarki201432@gmail.com
- GitHub: https://github.com/Sahil9599 (Repository: sahil.page.gd)
- Technical Skills: Linux, Python, TCP/IP, Nmap, Wireshark, Burp Suite, Splunk, SIEM, Git.
- Featured Projects:
  1. Network Recon Lab: Enumerating services on an isolated lab machine with Nmap, Wireshark, and Linux.
  2. Password Vault Audit: Reviewing demo password storage with OWASP ASVS and threat modeling.
  3. Threat Detection Dashboard: Synthesizing logs into actionable security alerts using Python and SIEM concepts.
- Learning Path: Google Cybersecurity Certificate, TryHackMe, CompTIA Security+.

Always be concise, security-minded, respectful, and helpful. Format your responses with clean markdown when helpful.`;

    if (role === 'mentor') {
      systemInstruction = `You are a supportive Cybersecurity Mentor in Zarki's interactive lab.
Explain networking, Linux CLI commands, web vulnerabilities (OWASP Top 10), and ethical hacking methodology simply and clearly. Emphasize that all security testing must be strictly authorized.`;
    } else if (role === 'threat_analyst') {
      systemInstruction = `You are a Senior Threat Analyst & Security Architect.
Provide in-depth, rigorous reasoning for technical security questions, malware triage, SIEM detection rules (Sigma/Splunk), vulnerability root-cause analysis, and threat modeling.`;
    }

    // Format messages for @google/genai SDK
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let response;
    let finalModelUsed = modelName;

    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
        },
      });
    } catch (primaryErr: any) {
      // If primary model has a high-demand spike (503) or error, fall back to gemini-3.1-flash-lite
      if (modelName !== 'gemini-3.1-flash-lite') {
        console.warn(`Primary model ${modelName} failed (${primaryErr.message}), falling back to gemini-3.1-flash-lite`);
        finalModelUsed = 'gemini-3.1-flash-lite';
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
          },
        });
      } else {
        throw primaryErr;
      }
    }

    const replyText = response.text || 'I could not generate a response. Please try again.';

    res.json({
      text: replyText,
      modelUsed: finalModelUsed,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    let userFriendlyError = error.message || 'Error communicating with Gemini model.';
    if (userFriendlyError.includes('503') || userFriendlyError.includes('UNAVAILABLE') || userFriendlyError.includes('high demand')) {
      userFriendlyError = 'The Gemini model is currently experiencing temporary high demand. Please wait a moment and try again.';
    }
    res.status(500).json({
      error: userFriendlyError,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
