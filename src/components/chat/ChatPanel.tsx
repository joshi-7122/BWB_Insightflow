import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReportData } from '@/types';
import { AnalysisService } from '@/services/analysis.service';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Send, Sparkles, X, Bot, User, Copy, Check, CornerDownLeft } from 'lucide-react';

interface ChatPanelProps {
  reportId: string;
  reportData: ReportData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMainVisualization?: (visualization: import('@/types').ChartDefinition) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  reportId,
  reportData,
  isOpen,
  onClose,
  onUpdateMainVisualization,
}) => {
  const { user } = useAuth();
  const userId = user?.id ?? 'demo-user';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      report_id: reportId,
      user_id: 'assistant',
      role: 'assistant',
      content: `Hello! I have analyzed **${reportData.title}**. Ask me any specific question about your data, metrics, or request custom charts below.`,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic context-aware suggested prompts
  const primaryMetric = reportData.metrics?.[0]?.name || 'Volume';
  const suggestedPrompts = [
    `Show ${primaryMetric} chart`,
    `What is the peak ${primaryMetric}?`,
    reportData.anomalies?.length ? 'Explain detected anomalies' : 'Summarize key findings',
    'What should I investigate next?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      report_id: reportId,
      user_id: userId,
      role: 'user',
      content: q,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantResponse = await AnalysisService.chatFollowUp(
        reportId,
        q,
        [...messages, userMsg],
        userId,
        reportData
      );
      setMessages((prev) => [...prev, assistantResponse]);

      if (
        assistantResponse.structured_response?.visualization &&
        onUpdateMainVisualization
      ) {
        onUpdateMainVisualization(assistantResponse.structured_response.visualization);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-50 flex flex-col shadow-2xl transition-all duration-300">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Conversational Analysis
            </h3>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]">
              Context: {reportData.title}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] space-y-2 rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Inline embedded visualization */}
                {msg.structured_response?.visualization && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="font-semibold text-slate-300 block font-mono text-[11px]">
                      📊 {msg.structured_response.visualization.title}
                    </span>
                    <div className="h-44 bg-slate-950/60 rounded-xl p-2 border border-slate-800">
                      <ChartRenderer
                        chart={msg.structured_response.visualization}
                        height={160}
                      />
                    </div>
                  </div>
                )}

                {!isUser && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing dataset query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Suggested Prompts Pills */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/50 flex flex-wrap gap-1.5">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors truncate max-w-[210px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this report..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            rightIcon={<CornerDownLeft className="w-4 h-4" />}
          >
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
};
