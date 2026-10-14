import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  AlertTriangle,
  Zap,
  Brain,
  ShieldAlert,
  Ship,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage, IncidentRecord, RescueTeam } from '../types';

interface GeminiChatbotProps {
  incidents?: IncidentRecord[];
  teams?: RescueTeam[];
  onSelectIncidentOnMap?: (incident: IncidentRecord) => void;
}

const PRESET_QUERIES = [
  {
    label: '🚨 Top Critical Rescues',
    text: 'What are the top 3 highest-priority critical rescues right now and what resources do they need?',
  },
  {
    label: '🚤 Fleet Deployment Status',
    text: 'Summarize all rescue boat squads: which are available, which are dispatched, and who has capacity?',
  },
  {
    label: '📍 Singh Nagar Evacuation Route',
    text: 'Generate a tactical evacuation route and safe shelter directive for Singh Nagar and Budameru canal corridor.',
  },
  {
    label: '🗣️ Translate Telugu Distress',
    text: 'Translate this Telugu message to tactical English and assign urgency: "డాబా పైన 8 మంది ఉన్నాము, చేతుల్లో చంటి పిల్లవాడు ఉన్నాడు, నీళ్లు మెడ దాకా వచ్చాయి"',
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  incidents = [],
  teams = [],
  onSelectIncidentOnMap,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Tactical AI Dispatch Advisor online. Operational context loaded with ${incidents.length} active incidents and ${teams.length} rescue squads.\n\nHow can I assist your command center? You can ask for priority triage rankings, boat fleet routing, shelter directives, or vernacular translation for Telugu and Hindi distress signals.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Build lightweight context snippet from current state
      const topCritical = incidents
        .filter((i) => i.triage.urgency === 'CRITICAL' && i.status !== 'EVACUATED')
        .slice(0, 5)
        .map(
          (i) =>
            `- ID: ${i.id} | Loc: ${i.triage.extracted_location} | Stranded: ${i.triage.people_stranded} | Depth: ${i.triage.water_depth} | Alerts: ${i.triage.vulnerable_tags.join(', ') || 'None'} | Team: ${i.assigned_team || 'Unassigned'}`
        )
        .join('\n');

      const fleetSummary = teams
        .map((t) => `- ${t.name}: ${t.status} (Type: ${t.type}, Base: ${t.base_location})`)
        .join('\n');

      const systemRole = `You are the Whisper Disaster Response Tactical AI Dispatcher & Crisis Advisor.
Operational Context:
Active Total Incidents: ${incidents.length}
Critical Unresolved Casualties:
${topCritical || 'No critical incidents currently pending.'}

Active Fleet Status:
${fleetSummary}

Rules:
1. Provide authoritative, precise, tactical bullet points suitable for emergency control room operators.
2. Prioritize vulnerable human lives (infants, elderly, dialysis patients, cardiac patients).
3. Recommend specific boat squads and relief centers (Bhavanipuram High School, IGMC Stadium, GGH).
4. Translate Telugu/Hindi distress text faithfully with cultural accuracy.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          systemRole,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Tactical directive logged.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Advisory Fallback Active**: Network latency detected connecting to Gemini API. Central command recommendations:\n\n- Deploy AP SDRF Gemini craft to Singh Nagar.\n- Prioritize infants and cardiac patients on upper terraces.\n- Maintain contact with NDRF 10th Bn.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (fallback)`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        text: 'Tactical AI Dispatch Advisor reset. Operational context refreshed. Ready for crisis commands.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Header & Model Selector */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Whisper Tactical AI Dispatch Advisor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              Multi-turn crisis reasoning powered by Gemini
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash" className="bg-slate-950">
                gemini-3.8-flash (General Triage)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-950">
                gemini-3.1-flash-lite (Ultra Fast)
              </option>
              <option value="gemini-4-argon" className="bg-slate-950">
                gemini-4-argon (Deep Strategic)
              </option>
            </select>
          </div>

          {/* Reset Chat */}
          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Reset conversation thread"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 font-medium shrink-0">Quick Queries:</span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(preset.text)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-xl p-3.5 text-xs leading-relaxed space-y-1 shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-800/40 font-mono">
                  <span className={isUser ? 'text-blue-200' : 'text-slate-400 font-semibold'}>
                    {isUser ? 'Command Dispatcher' : 'Whisper Tactical AI'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && !isUser && (
                      <span className="text-[9px] text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-900/60">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg shrink-0 bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Analyzing flood signals & formulating dispatch directive...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask tactical advisor: prioritize rescues, route boats, draft warning broadcasts, translate dialects..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-md shadow-blue-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
