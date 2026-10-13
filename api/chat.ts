import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, role = 'general', taskComplexity = 'general' } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in your hosting environment. Go to your Vercel Project Settings > Environment Variables, add Key 'GEMINI_API_KEY' with your Google AI Studio API key, and click Redeploy."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
- Featured Projects: Network Recon Lab, Password Vault Audit, Threat Detection Dashboard.
- Learning Path: Google Cybersecurity Certificate, TryHackMe, CompTIA Security+.

Always be concise, security-minded, respectful, and helpful.`;

    if (role === 'mentor') {
      systemInstruction = `You are a supportive Cybersecurity Mentor in Zarki's interactive lab. Explain networking, Linux CLI commands, web vulnerabilities (OWASP Top 10), and ethical hacking methodology simply and clearly.`;
    } else if (role === 'threat_analyst') {
      systemInstruction = `You are a Senior Threat Analyst & Security Architect. Provide in-depth reasoning for technical security questions, malware triage, SIEM detection rules, vulnerability root-cause analysis, and threat modeling.`;
    }

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
        config: { systemInstruction },
      });
    } catch (primaryErr: any) {
      if (modelName !== 'gemini-3.1-flash-lite') {
        finalModelUsed = 'gemini-3.1-flash-lite';
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: { systemInstruction },
        });
      } else {
        throw primaryErr;
      }
    }

    const replyText = response.text || 'I could not generate a response. Please try again.';

    res.status(200).json({
      text: replyText,
      modelUsed: finalModelUsed,
    });
  } catch (error: any) {
    console.error('Vercel Gemini API error:', error);
    res.status(500).json({
      error: error.message || 'Error communicating with Gemini model.',
    });
  }
}
