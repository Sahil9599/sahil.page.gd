import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  Brain,
  Shield,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  initialPrompt?: string;
}

export function GeminiChatbot({ isOpen, onClose, onOpen, initialPrompt }: GeminiChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Greetings! I'm Zarki's Cyber AI Assistant, powered by Gemini. Ask me about Zarki's security labs (Network Recon, Password Vault, Threat Detection), request a fast cybersecurity concept explanation, or get deep threat modeling analysis.",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'general' | 'mentor' | 'threat_analyst'>('general');
  const [taskComplexity, setTaskComplexity] = useState<'fast' | 'general' | 'complex'>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend proxy route
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          role,
          taskComplexity
        })
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            "Backend server (/api/chat) is not active on this static host. GitHub Pages only serves static files and cannot execute server-side Node.js code. To run full-stack AI with your custom domain sahil.page.gd, deploy this repository to Vercel or Render (both free), or test it directly in the AI Studio live preview!"
          );
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const aiMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      let friendlyError = err.message || 'Unable to connect to the Gemini service.';
      if (friendlyError.includes('default credentials') || friendlyError.includes('credentials')) {
        friendlyError =
          'GEMINI_API_KEY is not set in your Vercel deployment.\n\nTo fix this:\n1. Open your Vercel project dashboard\n2. Go to Settings > Environment Variables\n3. Add Key: GEMINI_API_KEY and Value: (your Gemini API key from Google AI Studio)\n4. Click Redeploy under Deployments tab!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: `⚠️ Error: ${friendlyError}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: "Chat history cleared. What would you like to explore next?",
        timestamp: 'Just now',
        modelUsed: taskComplexity === 'complex' ? 'gemini-3.1-pro-preview' : taskComplexity === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'
      }
    ]);
  };

  const starterChips = [
    { label: 'Network Recon Lab', prompt: 'Tell me about your Network Recon Lab and what tools were used.' },
    { label: 'Password Vault Audit', prompt: 'How does the Password Vault Audit project use OWASP ASVS threat modeling?' },
    { label: 'Nmap Scan Syntax (Fast)', prompt: 'What does `nmap -sV -sC target` do in simple terms?' },
    { label: 'Threat Modeling (Deep)', prompt: 'How should I design threat modeling for an authenticated web app?' }
  ];

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          type="button"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0d1412] text-[#c8ff35] border border-[#3b4b44] rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:border-[#c8ff35] hover:scale-105 transition-all duration-200 cursor-pointer group"
          aria-label="Open Cyber AI Chatbot"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff35] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c8ff35]" />
          </span>
          <Bot className="w-5 h-5 text-[#c8ff35] group-hover:rotate-12 transition-transform" />
          <span className="font-mono text-xs font-semibold tracking-wider text-slate-100">
            CYBER AI CHAT
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#09100e] border border-[#2b3934] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-200 ${
            isExpanded
              ? 'inset-4 md:inset-12 rounded-lg'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[600px] max-h-[85vh] rounded-xl'
          }`}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#22302b] bg-[#0c1613]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#14261f] border border-[#2b4437] flex items-center justify-center text-[#c8ff35]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white tracking-wide">
                    ZARKI CYBER AI
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#13221b] text-[#c8ff35] border border-[#2b4437]">
                    {taskComplexity === 'complex'
                      ? 'gemini-3.1-pro-preview'
                      : taskComplexity === 'fast'
                      ? 'gemini-3.1-flash-lite'
                      : 'gemini-3.5-flash'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#82928c]">
                  Multi-turn Gemini intelligence & security lab mentor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={clearChat}
                title="Reset conversation"
                className="p-1.5 text-[#82928c] hover:text-[#c8ff35] hover:bg-[#14221d] rounded transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 text-[#82928c] hover:text-white hover:bg-[#14221d] rounded transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close chat"
                className="p-1.5 text-[#82928c] hover:text-white hover:bg-[#14221d] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Bar: Role & Complexity */}
          <div className="px-3 py-2 bg-[#0a1210] border-b border-[#1b2622] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            {/* Persona Role */}
            <div className="flex items-center gap-1">
              <span className="text-[#6d7e78]">ROLE:</span>
              <button
                type="button"
                onClick={() => setRole('general')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  role === 'general'
                    ? 'bg-[#182922] text-[#c8ff35] border border-[#2c473a]'
                    : 'text-[#82928c] hover:text-white'
                }`}
              >
                Portfolio
              </button>
              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  role === 'mentor'
                    ? 'bg-[#182922] text-[#c8ff35] border border-[#2c473a]'
                    : 'text-[#82928c] hover:text-white'
                }`}
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => setRole('threat_analyst')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  role === 'threat_analyst'
                    ? 'bg-[#182922] text-[#c8ff35] border border-[#2c473a]'
                    : 'text-[#82928c] hover:text-white'
                }`}
              >
                Threat Analyst
              </button>
            </div>

            {/* Model Complexity Engine */}
            <div className="flex items-center gap-1">
              <span className="text-[#6d7e78]">ENGINE:</span>
              <button
                type="button"
                onClick={() => setTaskComplexity('fast')}
                title="Fast tasks: gemini-3.1-flash-lite"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  taskComplexity === 'fast'
                    ? 'bg-[#142c20] text-[#c8ff35] border border-[#264735]'
                    : 'text-[#7e8e88] hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" /> Fast
              </button>
              <button
                type="button"
                onClick={() => setTaskComplexity('general')}
                title="General tasks: gemini-3.5-flash"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  taskComplexity === 'general'
                    ? 'bg-[#142c20] text-[#c8ff35] border border-[#264735]'
                    : 'text-[#7e8e88] hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-sky-400" /> General
              </button>
              <button
                type="button"
                onClick={() => setTaskComplexity('complex')}
                title="Complex tasks: gemini-3.1-pro-preview"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  taskComplexity === 'complex'
                    ? 'bg-[#142c20] text-[#c8ff35] border border-[#264735]'
                    : 'text-[#7e8e88] hover:text-white'
                }`}
              >
                <Brain className="w-3 h-3 text-purple-400" /> Pro Deep
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-md bg-[#12231c] border border-[#284134] flex items-center justify-center shrink-0 text-[#c8ff35] mt-1">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm relative group ${
                    msg.role === 'user'
                      ? 'bg-[#14241e] text-[#f0f4f2] border border-[#294236]'
                      : 'bg-[#0f1715] text-[#d4ded9] border border-[#1f2d28]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-[#788882]">
                    <span>{msg.role === 'user' ? 'You' : 'Zarki AI'}</span>
                    <div className="flex items-center gap-1.5">
                      {msg.modelUsed && (
                        <span className="text-[#a4e234] text-[9px]">
                          [{msg.modelUsed}]
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-white"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-lime-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-[13px]">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-md bg-[#12231c] border border-[#284134] flex items-center justify-center shrink-0 text-[#c8ff35]">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#0f1715] border border-[#1f2d28] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c8ff35] animate-bounce [animation-delay:-0.3s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c8ff35] animate-bounce [animation-delay:-0.15s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c8ff35] animate-bounce" />
                  <span className="text-xs font-mono text-[#7a8c85] ml-1">
                    Analyzing security context ({taskComplexity})...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 pt-1 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
              {starterChips.map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSend(chip.prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#111e19] hover:bg-[#192d25] border border-[#263c32] text-[#b6c6bf] text-[11px] font-mono hover:text-[#c8ff35] hover:border-[#c8ff35] transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Form */}
          <div className="p-3 border-t border-[#1e2c27] bg-[#0c1613]">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask Gemini about security labs, tools, or threat models..."
                className="flex-1 max-h-28 min-h-[40px] p-2.5 bg-[#08100e] text-white border border-[#273831] rounded-lg text-xs font-mono placeholder:text-[#5d6c66] focus:outline-none focus:border-[#c8ff35] resize-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-[40px] px-3.5 bg-[#c8ff35] hover:bg-[#b5eb2c] disabled:opacity-40 disabled:hover:bg-[#c8ff35] text-[#0b0d0d] rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-1 text-[10px] font-mono text-[#5b6a64] text-center">
              Powered by @google/genai SDK · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
