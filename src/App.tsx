import React, { useMemo, useRef, useState, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Crown, Map, Share2, DollarSign, Gamepad2, User, Mountain, 
  Zap, Package, Code, Layout, Database, Cpu, ShieldCheck, 
  Server, Activity, Hexagon, Loader2, Settings, X, Minimize2, Maximize2,
  FolderPlus, Trash2, Users, Monitor, Smartphone, FileText, ChevronRight, FileCode, Sparkles, RefreshCcw, ExternalLink,
  Download, MousePointer2, Terminal, HardDrive, Box, Hammer, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AGENTS, Agent, AgentLevel } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Crown, Map, Share2, DollarSign, Gamepad2, User, Mountain, 
  Zap, Package, Code, Layout, Database, Cpu, ShieldCheck, 
  Server, MousePointer2, Terminal, FileText, Sparkles
};

interface Group {
  id: string;
  name: string;
  agentIds: string[];
}

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  isActive: boolean;
  onDrag: () => void;
  onDragEnd?: (agentId: string, info: any) => void;
  isOrchestrating?: boolean;
  isInGroup?: boolean;
}

const SUGGESTED_PROMPTS = [
  "A 2D cyberpunk endless runner where you play as a neon-cyan square dodging red lasers.",
  "A 3D space shooter where meteorites fall from the top and you shoot them.",
  "Ek top-down zombie survival game har kill par 10 points, spooky dark theme.",
  "A puzzle game where you connect pipes to let glowing energy flow to the core.",
  "A retro arcade platformer where you collect golden coins and avoid spike traps.",
  "A 3D open-world GTA-style game where you can drive cars, walk around a detailed city, and interact with NPCs.",
  "An expansive 3D survival crafting game in a procedurally generated forest with day/night cycles, base building, and hostile wildlife.",
  "A 3D sci-fi open-world exploration game set on Mars, featuring a driveable rover, resource mining, and realistic terrain physics.",
  "A 3D fantasy RPG open world with a medieval castle, magical spells with particle effects, and a dragon boss fight.",
  "A post-apocalyptic 3D open-world wasteland with scavengable ruins, dynamic weather, and a drivable motorcycle."
];

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isActive, onDrag, onDragEnd, isOrchestrating, isInGroup }) => {
  const Icon = ICON_MAP[agent.icon] || Hexagon;
  
  const isSelfProcessing = agent.status === 'processing' || (isOrchestrating && (agent.id === 'ceo' || agent.id === 'planning'));
  
  return (
    <motion.div
      layoutId={`card-${agent.id}`}
      id={agent.id}
      onClick={onClick}
      drag
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={(_, info) => onDragEnd?.(agent.id, info)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isInGroup ? 1.02 : 1.05 }}
      whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
      className={cn(
        "relative group cursor-grab p-2 rounded-xl border transition-all duration-300 shrink-0",
        isInGroup ? "w-24" : "w-36",
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg",
        isActive 
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10" 
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          "p-1.5 rounded-lg relative flex items-center justify-center min-w-[32px] min-h-[32px]",
          isSelfProcessing ? "bg-blue-500/5 text-blue-500" :
          agent.status === 'active' ? "bg-emerald-500/10 text-emerald-500" :
          "bg-zinc-500/10 text-zinc-500"
        )}>
          {isSelfProcessing && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={100}
                className="opacity-10"
              />
              <motion.circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={113}
                animate={{ strokeDashoffset: [113, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          )}
          {agent.id === 'ceo' && (agent.status === 'active' || isOrchestrating) && (
            <motion.div 
              className="absolute inset-0 bg-emerald-500/30 rounded-lg"
              animate={{ scale: isOrchestrating ? [1, 1.8, 1] : [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: isOrchestrating ? 1 : 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.div
            animate={(agent.id === 'ceo' && (agent.status === 'active' || isOrchestrating)) ? {
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            } : {}}
            transition={{
              duration: isOrchestrating ? 1.5 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 flex items-center justify-center text-current"
          >
          <Icon size={18} />
          </motion.div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
          <h3 className="font-bold text-[10px] text-zinc-900 dark:text-zinc-100 line-clamp-1 pr-1">{agent.name}</h3>
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
              L{agent.level}
            </span>
          </div>
        <p className="text-[8px] text-zinc-500 mt-0.5 line-clamp-1">{agent.description}</p>
        </div>
      </div>

    <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {agent.specialty.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[7px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {s}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800/50">
          {isSelfProcessing ? (
            <Loader2 size={10} className="text-blue-500 animate-spin" />
          ) : (
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              agent.status === 'idle' ? "bg-zinc-400" :
              agent.status === 'active' ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" :
              "bg-blue-500 animate-pulse shadow-[0_0_4px_rgba(59,130,246,0.5)]"
            )} />
          )}
          <span className={cn(
            "text-[8px] font-bold uppercase tracking-tight",
            agent.status === 'idle' ? "text-zinc-500" :
            agent.status === 'active' ? "text-emerald-600 dark:text-emerald-400" :
            "text-blue-600 dark:text-blue-400"
          )}>
            {agent.status === 'active' ? 'Ready' :
             agent.status === 'idle' ? 'Idle' :
             agent.level <= 2 ? 'Thinking' :
             agent.level <= 5 ? 'Coding' :
             agent.level === 6 ? 'Fixing' : 'Working'}
          </span>
        </div>
      </div>

      {(agent.status === 'processing' || isSelfProcessing) && (
        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

interface ConnectionLineProps {
  fromId: string;
  toId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  dragTrigger: number;
  isActive?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ fromId, toId, containerRef, dragTrigger, isActive }) => {
  const [coords, setCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    const updateCoords = () => {
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);
      const container = containerRef.current;

      if (fromEl && toEl && container) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (fromRect.width === 0 || toRect.width === 0) return;

        setCoords({
          x1: fromRect.right - containerRect.left,
          y1: fromRect.top + fromRect.height / 2 - containerRect.top,
          x2: toRect.left - containerRect.left,
          y2: toRect.top + toRect.height / 2 - containerRect.top
        });
      }
    };

    updateCoords();
    // Delay slightly to ensure layout is settled
    const timeout = setTimeout(updateCoords, 50);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('resize', updateCoords);
      clearTimeout(timeout);
    };
  }, [fromId, toId, containerRef, dragTrigger]);

  if (!coords) return null;

  const { x1, y1, x2, y2 } = coords;
  const midX = x1 + (x2 - x1) * 0.5;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
      <defs>
        <linearGradient id={`grad-${fromId}-${toId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isActive ? "#60a5fa" : "#334155"} stopOpacity="0.4" />
          <stop offset="50%" stopColor={isActive ? "#3b82f6" : "#475569"} stopOpacity="0.7" />
          <stop offset="100%" stopColor={isActive ? "#60a5fa" : "#334155"} stopOpacity="0.4" />
        </linearGradient>
        
        <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Glow / Halo */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(100, 116, 139, 0.1)"}
        strokeWidth={isActive ? "10" : "6"}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: "blur(8px)" }}
      />

      {/* Connection "Tube" Background */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? "rgba(59, 130, 246, 0.1)" : "rgba(100, 116, 139, 0.05)"}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Main Animated Path */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#grad-${fromId}-${toId})`}
        strokeWidth={isActive ? "2" : "1.2"}
        strokeLinecap="round"
        strokeDasharray={isActive ? "none" : "4 4"}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Energy Pulses */}
      {isActive && [0, 0.3, 0.6].map((delay, index) => (
        <circle key={index} r="1.5" fill="#fff" style={{ filter: "drop-shadow(0 0 3px #fff) drop-shadow(0 0 8px #3b82f6)" }}>
          <animateMotion 
            path={path} 
            dur="1.8s" 
            repeatCount="indefinite" 
            begin={`${delay}s`}
            calcMode="spline"
            keySplines="0.42 0 0.58 1"
          />
        </circle>
      ))}

      {/* Pulsing Core Point */}
      <motion.circle
        cx={x1} cy={y1} r="2.5"
        fill={isActive ? "#3b82f6" : "#64748b"}
        animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx={x2} cy={y2} r="2.5"
        fill={isActive ? "#3b82f6" : "#64748b"}
        animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  );
};

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dragTrigger, setDragTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // Load Groups from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem('youkta_groups');
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (e) {
        console.error('Failed to parse groups', e);
      }
    }
  }, []);

  const saveGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
    localStorage.setItem('youkta_groups', JSON.stringify(newGroups));
  };

  const groupedAgentIds = useMemo(() => new Set(groups.flatMap(g => g.agentIds)), [groups]);

  const levels = useMemo(() => {
    const levelMap: Record<number, Agent[]> = {};
    AGENTS.forEach(agent => {
      if (groupedAgentIds.has(agent.id)) return;
      if (!levelMap[agent.level]) levelMap[agent.level] = [];
      levelMap[agent.level].push(agent);
    });
    return Object.entries(levelMap).sort(([a], [b]) => Number(a) - Number(b));
  }, [groupedAgentIds]);

  const allConnections = useMemo(() => {
    const list: { from: string; to: string }[] = [];
    AGENTS.forEach(agent => {
      agent.connections.forEach(targetId => {
        list.push({ from: agent.id, to: targetId });
      });
    });
    return list;
  }, []);

  const handleDrag = () => {
    setDragTrigger(prev => prev + 1);
  };

  const handleDragEnd = (agentId: string, info: any) => {
    const { point } = info;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const absoluteX = point.x + scrollX;
    const absoluteY = point.y + scrollY;

    // Check collision with group containers
    const groupElements = document.querySelectorAll('[data-group-id]');
    let targetGroupId: string | null = null;

    groupElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (
        point.x >= rect.left && 
        point.x <= rect.right && 
        point.y >= rect.top && 
        point.y <= rect.bottom
      ) {
        targetGroupId = el.getAttribute('data-group-id');
      }
    });

    if (targetGroupId) {
      // Add agent to group
      const newGroups = groups.map(g => {
        if (g.id === targetGroupId && !g.agentIds.includes(agentId)) {
          return { ...g, agentIds: [...g.agentIds, agentId] };
        }
        return g;
      });
      saveGroups(newGroups);
    } else {
      // Check if it was removed from a group by dragging it out
      // (Optional: for simplicity, we could have a "Remove from group" button)
    }
    
    setDragTrigger(prev => prev + 1);
  };

  const createGroup = () => {
    const name = prompt('Enter Group Name:');
    if (!name) return;
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      agentIds: []
    };
    saveGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    saveGroups(groups.filter(g => g.id !== groupId));
  };

  const removeFromGroup = (groupId: string, agentId: string) => {
    saveGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, agentIds: g.agentIds.filter(id => id !== agentId) };
      }
      return g;
    }));
  };

  const [instruction, setInstruction] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [agentKeys, setAgentKeys] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('youkta_agent_keys');
      return { global: process.env.GEMINI_API_KEY || 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM', ...(saved ? JSON.parse(saved) : {}) };
    } catch (e) {
      return { global: process.env.GEMINI_API_KEY || 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM' };
    }
  });
  const [apiConfig, setApiConfig] = useState<{provider: string, baseUrl: string, model: string}>(() => {
    try {
      const saved = localStorage.getItem('youkta_api_config');
      if (saved) return JSON.parse(saved);
      const envKey = process.env.GEMINI_API_KEY || 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM';
      if (envKey.startsWith('nvapi-')) return { provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct' };
      if (envKey.startsWith('gsk_')) return { provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile' };
      if (envKey.startsWith('sk-') && !envKey.includes('ant')) return { provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
      return { provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash' };
    } catch (e) {
      return { provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash' };
    }
  });
  const [agentApiConfigs, setAgentApiConfigs] = useState<Record<string, {provider: string, baseUrl: string, model: string}>>(() => {
    try {
      const saved = localStorage.getItem('youkta_agent_api_configs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [viewMode, setViewMode] = useState<'orchestrator' | 'preview' | 'code'>('orchestrator');
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedProject, setGeneratedProject] = useState<{
    title: string;
    description: string;
    creator?: string;
    files: { name: string; content: string; language: string }[];
  } | null>(null);

  const systemBlueprint = useMemo(() => ({
    timestamp: new Date().toISOString(),
    orchestration: {
      status: isDeploying ? 'DEPLOYING' : 'IDLE',
      progress: overallProgress,
      difficulty: difficulty
    },
    agents: AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      status: a.status,
      level: a.level,
      group: groups.find(g => g.agentIds.includes(a.id))?.name || 'ROOT'
    })),
    topology: {
      groups: groups.map(g => ({ name: g.name, memberCount: g.agentIds.length })),
      connections: allConnections.length
    }
  }), [isDeploying, overallProgress, difficulty, groups, allConnections]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsMinimized, setIsSettingsMinimized] = useState(false);
  const [isCommandBarMinimized, setIsCommandBarMinimized] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [isBoostEnabled, setIsBoostEnabled] = useState(true);
  const [streamingCode, setStreamingCode] = useState('');
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDeploying && codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [streamingCode, isDeploying]);

  const [isModifyMode, setIsModifyMode] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile-portrait' | 'mobile-landscape'>('desktop');

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isTerminalExpanded, isTerminalMinimized]);

  const [copied, setCopied] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SUGGESTED_PROMPTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateAgentKey = (agentId: string, key: string) => {
    const newKeys = { ...agentKeys, [agentId]: key };
    setAgentKeys(newKeys);
    localStorage.setItem('youkta_agent_keys', JSON.stringify(newKeys));

    let newConfig = null;
    if (key.startsWith('AIzaSy')) {
      newConfig = { provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash' };
    } else if (key.startsWith('nvapi-')) {
      newConfig = { provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct' };
    } else if (key.startsWith('gsk_')) {
        newConfig = { provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile' };
    } else if (key.startsWith('sk-') && !key.includes('ant')) {
      newConfig = { provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
    }
    
    if (newConfig) {
      if (agentId === 'global') {
        setApiConfig(newConfig);
        localStorage.setItem('youkta_api_config', JSON.stringify(newConfig));
      } else {
        const newConfigs = { ...agentApiConfigs, [agentId]: newConfig };
        setAgentApiConfigs(newConfigs);
        localStorage.setItem('youkta_agent_api_configs', JSON.stringify(newConfigs));
      }
    }
  };

  const handleUpdateAgentApiConfig = (agentId: string, config: any) => {
    const newConfigs = { ...agentApiConfigs };
    if (!config) delete newConfigs[agentId];
    else newConfigs[agentId] = config;
    setAgentApiConfigs(newConfigs);
    localStorage.setItem('youkta_agent_api_configs', JSON.stringify(newConfigs));
  };

  const difficultyConfig = {
    EASY: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Casual / Low Latency' },
    MEDIUM: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Balanced / Standard' },
    HARD: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Ultra / High-Fidelity' }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isDeploying) return;

    const fallbackProfiles: Array<{ apiKey: string, apiConfig: any, sourceName: string }> = [];
    const addedKeys = new Set<string>();

    const addProfile = (key: string, config: any, sourceName: string) => {
      if (key && typeof key === 'string' && key.trim() !== '' && !addedKeys.has(key.trim())) {
        fallbackProfiles.push({ apiKey: key.trim(), apiConfig: config, sourceName });
        addedKeys.add(key.trim());
      }
    };

    addProfile(agentKeys['global'] || process.env.GEMINI_API_KEY || '', apiConfig, 'Global Key');
    for (const [keyId, keyVal] of Object.entries(agentKeys)) {
      if (keyId !== 'global' && keyId !== 'meshy' && keyId !== 'luma' && keyId !== 'elevenlabs' && keyId !== 'github_token') {
         addProfile(keyVal as string, agentApiConfigs[keyId] || apiConfig, `${keyId} Key`);
      }
    }

    if (fallbackProfiles.length === 0) {
      alert("SYSTEM HALTED: No Global API Key found. Please click the Settings gear icon and add your API Key first!");
      setIsSettingsOpen(true);
      return;
    }

    setLastPrompt(instruction);
    setIsModifyMode(false);
    setIsDeploying(true);
    setOverallProgress(0);
    setStreamingCode('// [SYSTEM] Establishing neural link...\n');
    setLogs(['[SYSTEM] Initializing Robot Core...', '[AUTH] Verifying API Credentials...', '[SYNC] Handshaking with Neural Cluster...']);
    
    // Switch to code view to see live progress
    setViewMode('code');

    // Simulate swarm orchestration with Turbo Boost support
    const intervalTime = isBoostEnabled ? 150 : 400;
    const progressStep = isBoostEnabled ? 15 : 10;

    const logMessages = [
      '[ORCHESTRATOR] Scaling compute nodes...',
      '[PLANNING] Building project roadmap...',
      '[PROGRAMMING] Compiling logic with Gemini API...',
      '[ENGINE] Generating HTML5 game engine...',
      '[DESIGN] Crafting inline CSS elements...',
      '[QA] Verifying syntax integrity...'
    ];

    const codeChunks = [
      "// [AI] Analyzing game loop requirements...\n",
      "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n",
      "  <meta charset=\"UTF-8\">\n  <title>Swarm Generated App</title>\n",
      "  <style>\n    body { margin: 0; overflow: hidden; background: #0a0a0a; color: #fff; }\n    canvas { display: block; }\n  </style>\n</head>\n<body>\n",
      "  <canvas id=\"gameCanvas\"></canvas>\n  <script>\n",
      "    // [AI] Injecting Universal Control Engine...\n    const keys = { w: false, a: false, s: false, d: false };\n",
      "    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);\n    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);\n",
      "    // [AI] Generating Game Loop...\n    let lastTime = 0;\n",
      "    function update(dt) {\n      // AI is writing physics logic...\n    }\n",
      "    function draw() {\n      // AI is rendering scene...\n    }\n",
      "    function loop(time) {\n      requestAnimationFrame(loop);\n      update((time - lastTime) / 1000);\n      draw();\n      lastTime = time;\n    }\n",
      "    // [SYSTEM] Compiling final neural matrices. Please wait...\n"
    ];
    let chunkIndex = 0;

    let isFetchDone = false;

    const interval = setInterval(() => {
      setOverallProgress(prev => {
        const next = prev + Math.random() * progressStep;
        
        if (Math.random() > 0.6 && next < 100) {
          const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
          setLogs(l => [...l.slice(-15), msg]);
        }

        if (chunkIndex < codeChunks.length && Math.random() > 0.3 && next < 90) {
          setStreamingCode(prevCode => prevCode + codeChunks[chunkIndex]);
          chunkIndex++;
        }

        if (next >= 90 && !isFetchDone) {
          return 90; // Wait at 90% for the real API to finish
        }

        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    try {
      const isUnity = instruction.toLowerCase().includes('unity');
      const isGodot = instruction.toLowerCase().includes('godot');
      const targetEngine = isUnity ? 'UNITY' : isGodot ? 'GODOT' : 'WEB';

      const basePrompt = `[CEO NEURAL BRAIN ACTIVATED]
IDENTITY: Prime Lucifer - Elite Game Studio CEO & Master Architect.
DIRECTIVE: "${instruction}"

--- CEO LOGIC ENGINE PIPELINE ---
1. STRATEGIC BRAIN ANALYSIS: Flawlessly interpret English, Hindi, or Hinglish inputs. 
   - Analyze core requirements. If it's a game, invent win/loss conditions, scoring, logic, progression, and controls.
   - CRITICAL: Implement Universal Controls (WASD/Mouse/Touch) and a Pause Menu for games.
2. TECHNICAL ARCHITECTURE: Target Environment: ${targetEngine}.
${targetEngine === 'UNITY' 
  ? '3. MULTI-FILE ARCHITECTURE: Act as a MULTI-FILE ARCHITECT. Generate a minimal valid Unity project scaffold. Include \`ProjectSettings/ProjectVersion.txt\` with "m_EditorVersion: 2022.3.10f1", a basic \`Assets/Scenes/SampleScene.unity\`, and core C# scripts in \`Assets/Scripts/\`.' 
  : targetEngine === 'GODOT'
  ? '3. MULTI-FILE ARCHITECTURE: Act as a MULTI-FILE ARCHITECT. Generate a minimal valid Godot project scaffold. Include \`project.godot\` with basic settings, a main \`Scene.tscn\`, and core GDScript \`Player.gd\`.'
  : '3. FILE GENERATION: Generate a clean, production-ready HTML5 project. Use pure Vanilla JavaScript, HTML5 Canvas, and CSS. Ensure a complete requestAnimationFrame loop is present, the canvas resizes perfectly to the window, and variables are globally scoped so it runs directly in a browser.'}

CRITICAL OUTPUT FORMAT:
You MUST output EACH file using this strict format:
     ### FILE: [File Path Here]
     \`\`\`[language]
     [Code Content Here]
     \`\`\`
Do NOT use JSON. Only output the raw code wrapped in markdown blocks preceded by the ### FILE: marker.`;

      let generatedHtml = '';
      let parsedFiles: { name: string; content: string; language: string }[] = [];

      const MAX_RETRIES = 5;
      let attempt = 0;
      let profileIndex = 0;
      let currentPrompt = basePrompt;

      while (attempt < MAX_RETRIES) {
        attempt++;
        const currentProfile = fallbackProfiles[profileIndex];
        const apiKey = currentProfile.apiKey;
        const currentApiConfig = currentProfile.apiConfig;
        try {
          if (currentApiConfig.provider === 'gemini') {
            const geminiModel = currentApiConfig.model || 'gemini-1.5-flash';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: currentPrompt }] }]
              })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API request failed');
            generatedHtml = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            const baseUrl = (currentApiConfig.baseUrl || '').trim().replace(/\/$/, '');
            let modelName = (currentApiConfig.model || '').trim();
            if (modelName.includes('safety-guard')) modelName = 'meta/llama3-70b-instruct';
            try {
              const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ 
                  model: modelName, 
                  messages: [{ role: 'user', content: currentPrompt }],
                  ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {})
                })
              });
              
              const data = await response.json();
              if (!response.ok) {
                const errorMsg = data.error?.message || data.detail || data.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) || `API request failed: ${response.status}`;
                throw new Error(errorMsg);
              }
              generatedHtml = data.choices?.[0]?.message?.content || '';
            } catch (fetchErr: any) {
              if (fetchErr.message === 'Failed to fetch' || fetchErr.message.includes('NetworkError')) {
                const proxyRes = await fetch('http://localhost:3001/api/proxy/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    url: `${baseUrl}/chat/completions`, 
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, 
                    body: { model: modelName, messages: [{ role: 'user', content: currentPrompt }], ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {}) } 
                  })
                });
                const data = await proxyRes.json();
                if (!proxyRes.ok) {
                  const errorMsg = data.error?.message || data.detail || data.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) || `API request failed: ${proxyRes.status}`;
                  throw new Error(errorMsg);
                }
                if (data.error && data.error.message) throw new Error(data.error.message);
                generatedHtml = data.choices?.[0]?.message?.content || '';
              } else {
                throw fetchErr;
              }
            }
          }

          if (generatedHtml.includes('"User Safety"')) {
            throw new Error("MODEL ERROR: You are using the 'safety-guard' model! Please change the Model Name to 'meta/llama-3.1-70b-instruct' in Settings.");
          }

          parsedFiles = [];
          const fileBlocks = generatedHtml.split(/### FILE:\s*/i);
          if (fileBlocks.length > 1) {
             for (let i = 1; i < fileBlocks.length; i++) {
                const block = fileBlocks[i];
                const lines = block.split('\n');
                const filePath = lines[0].trim();
                const codeMatch = block.match(/```[a-z]*\s*([\s\S]*?)```/i);
                if (filePath && codeMatch) {
                   parsedFiles.push({
                      name: filePath,
                      content: codeMatch[1].trim(),
                      language: filePath.split('.').pop() || 'text'
                   });
                } else if (filePath) {
                   const codeContent = lines.slice(1).join('\n').replace(/```[a-z]*\s*/gi, '').replace(/```/g, '').trim();
                   if (codeContent) {
                     parsedFiles.push({
                        name: filePath,
                        content: codeContent,
                        language: filePath.split('.').pop() || 'text'
                     });
                   }
                }
             }
          }

          if (parsedFiles.length === 0) {
            let jsonContent = generatedHtml.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();
            const startIndex = jsonContent.indexOf('[');
            const endIndex = jsonContent.lastIndexOf(']');
            
            if (startIndex !== -1 && endIndex !== -1) {
               jsonContent = jsonContent.substring(startIndex, endIndex + 1);
               try {
                  const filesArr = JSON.parse(jsonContent);
                  if (Array.isArray(filesArr) && filesArr.length > 0) {
                      parsedFiles = filesArr.map((f: any) => ({ 
                          name: f.name || f.path || 'UnknownFile.txt', 
                          content: f.content || '', 
                          language: f.language || f.name?.split('.').pop() || 'text' 
                      }));
                  }
               } catch (e) {
                  console.warn("JSON parsing failed, falling back to regex");
               }
            }
          }

          if (parsedFiles.length === 0 && targetEngine === 'WEB') {
              const htmlMatch = generatedHtml.match(/```(?:html)?\s*([\s\S]*?)```/i);
              const cssMatch = generatedHtml.match(/```(?:css)?\s*([\s\S]*?)```/i);
              const jsMatch = generatedHtml.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
              
              let finalHtml = '';
              if (htmlMatch && (cssMatch || jsMatch)) {
                  finalHtml = htmlMatch[1];
                  if (cssMatch && !finalHtml.includes(cssMatch[1].substring(0, 20))) {
                      finalHtml = finalHtml.includes('</head>') ? finalHtml.replace('</head>', `<style>\n${cssMatch[1]}\n</style>\n</head>`) : finalHtml + `<style>\n${cssMatch[1]}\n</style>`;
                  }
                  if (jsMatch && !finalHtml.includes(jsMatch[1].substring(0, 20))) {
                      finalHtml = finalHtml.includes('</body>') ? finalHtml.replace('</body>', `<script>\n${jsMatch[1]}\n</script>\n</body>`) : finalHtml + `<script>\n${jsMatch[1]}\n</script>`;
                  }
              } else if (htmlMatch) {
                  finalHtml = htmlMatch[1];
              } else if (jsMatch || cssMatch) {
                  finalHtml = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${cssMatch ? cssMatch[1] : 'body { margin: 0; overflow: hidden; background: #000; } canvas { display: block; }'}\n</style>\n</head>\n<body>\n<script>\n${jsMatch ? jsMatch[1] : ''}\n</script>\n</body>\n</html>`;
              } else {
                  const cleanCode = generatedHtml.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
                  if (cleanCode.includes('<html') || cleanCode.includes('<body') || cleanCode.includes('<canvas')) {
                      finalHtml = cleanCode;
                  } else {
                      finalHtml = `<!DOCTYPE html>\n<html>\n<head>\n<style>body { margin: 0; overflow: hidden; background: #000; } canvas { display: block; }</style>\n</head>\n<body>\n<script>\n${cleanCode}\n</script>\n</body>\n</html>`;
                  }
              }
              if (finalHtml) {
                parsedFiles = [
                  { name: 'index.html', language: 'html', content: finalHtml },
                  { name: 'README.md', language: 'markdown', content: `# ${instruction}\n\nGenerated live by Youkta Swarm API` }
                ];
              }
          }

          let validationError = null;
          if (parsedFiles.length === 0) {
            validationError = "No valid files were extracted.";
          } else if (targetEngine === 'WEB') {
            const hasCanvas = parsedFiles.some(f => f.content.includes('<canvas') || f.content.includes('document.createElement("canvas")') || f.content.includes("createElement('canvas')"));
            const hasRaf = parsedFiles.some(f => f.content.includes('requestAnimationFrame'));
            if ((!hasCanvas || !hasRaf) && instruction.toLowerCase().includes('game')) {
              validationError = "Missing <canvas> or requestAnimationFrame for Web Game.";
            }
          } else if (targetEngine === 'GODOT') {
            if (!parsedFiles.some(f => f.name.includes('project.godot'))) {
              validationError = "Missing project.godot file for Godot project.";
            }
          } else if (targetEngine === 'UNITY') {
            if (!parsedFiles.some(f => f.name.includes('ProjectVersion.txt') || f.name.includes('.cs'))) {
              validationError = "Missing basic Unity project files.";
            }
          }

          if (validationError && attempt < MAX_RETRIES) {
            currentPrompt = `${basePrompt}\n\n[SYSTEM ERROR]: Previous output failed validation: ${validationError}\nCRITICAL: Please ensure you strictly follow the ### FILE: syntax and include the necessary files.`;
            setLogs(l => [...l.slice(-15), `[SYSTEM] Validation failed: ${validationError}. Retrying (Attempt ${attempt + 1}/${MAX_RETRIES})...`]);
            continue;
          } else if (validationError) {
            throw new Error(`VALIDATION FAILED: ${validationError}`);
          }

          break; // successfully passed validation
        } catch (error: any) {
          const errMsg = error.message || String(error);
          const isFallbackable = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota") || errMsg.includes("401") || errMsg.includes("403") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("key") || errMsg.includes("models/") || errMsg.toLowerCase().includes("not found");
          if (isFallbackable && profileIndex < fallbackProfiles.length - 1) {
             profileIndex++;
             setLogs(l => [...l.slice(-15), `[SYSTEM] API issue detected. Seamlessly switching to ${fallbackProfiles[profileIndex].sourceName}...`]);
             attempt--; 
             continue; 
          }
          const isHighDemand = errMsg.includes("503") || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded");
          
          if (isHighDemand && attempt < MAX_RETRIES) {
            setLogs(l => [...l.slice(-15), `[SYSTEM] High Demand (503). Auto-retrying attempt ${attempt}/${MAX_RETRIES}...`]);
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000 + Math.random() * 1000));
          } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota")) {
            throw new Error("429_QUOTA_EXHAUSTED");
          } else if (attempt === MAX_RETRIES) {
            throw error;
          } else {
            setLogs(l => [...l.slice(-15), `[SYSTEM] Warning: ${errMsg}. Retrying (Attempt ${attempt + 1}/${MAX_RETRIES})...`]);
          }
        }
      }

      isFetchDone = true;

      setOverallProgress(100);
      setIsDeploying(false);
      setLogs(l => [...l, '[SUCCESS] Real Game Code Generated by Gemini API!']);
      
      setGeneratedProject({
        title: instruction.split(' ').slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'AI Game',
        description: `Playable HTML5 game generated live for: "${instruction}"`,
        creator: "Youbaraj",
        files: parsedFiles
      });
      
      setSelectedFile(parsedFiles[0]?.name || 'index.html');
      setLastSavedPath(null);
    } catch (error: any) {
      isFetchDone = true;
      clearInterval(interval);
      setIsDeploying(false);
      
      const errMsg = error.message || String(error);
      let reason = "Unknown error occurred.";
      let fix = "Please try again later.";
      
      if (errMsg === "429_QUOTA_EXHAUSTED" || errMsg.toLowerCase().includes("quota") || errMsg.includes("429") || errMsg.toLowerCase().includes("exhausted")) {
        reason = "API Rate Limit (15 RPM) Reached.";
        fix = "Generated a Fallback Template for now. Wait 1 minute and try again.";
        
        setGeneratedProject({
          title: "Offline Fallback App",
          description: "Offline template loaded because AI quota was exhausted.",
          files: [{
            name: "index.html",
            language: "html",
            content: "<!-- System meticulously handcrafted by Youbaraj -->\n<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody{background:#000;color:#0f0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;flex-direction:column;}\n</style>\n</head>\n<body>\n<h2>System Offline</h2>\n<p>Your API Quota was exhausted. Please wait 1 minute before generating again.</p>\n</body>\n</html>"
          }]
        });
        setSelectedFile('index.html');
      } else if (errMsg.toLowerCase().includes("api key not valid") || errMsg.toLowerCase().includes("api_key")) {
        reason = "Your API Key is missing, invalid, or has been revoked.";
        fix = "Open Settings (Gear Icon) and paste a valid API Key for your selected provider.";
      } else if (errMsg.toLowerCase().includes("high demand") || errMsg.includes("503") || errMsg.toLowerCase().includes("overloaded")) {
        reason = "The AI model is currently experiencing high demand (503).";
        fix = "Spikes in demand are temporary. Please wait a minute and try again, or switch AI providers in Settings.";
      } else if (errMsg.includes("models/") || errMsg.toLowerCase().includes("not found")) {
        reason = "The selected Gemini model is not supported or not found.";
        fix = "Check the model name in the code and update to a supported version.";
      } else if (errMsg === "Failed to fetch") {
        reason = "Network or CORS error. Local proxy also failed.";
        fix = "Ensure the local backend is running (start.bat) and check your internet connection.";
      } else if (errMsg.includes("safety-guard") || errMsg.includes("MODEL ERROR")) {
        reason = errMsg;
        fix = "Open Settings, set Model Name to 'meta/llama3-70b-instruct', and click Save & Start.";
      } else if (errMsg.includes("API Error") || errMsg.includes("Non-JSON")) {
        reason = errMsg;
        fix = "Check your NVIDIA API Key on build.nvidia.com and verify your credits.";
      } else {
        reason = errMsg;
        fix = "Check your internet connection and try simplifying your prompt.";
      }

      setLogs(l => [
        ...l, 
        `[ERROR] System Halted!`,
        `[REASON] ${reason}`,
        `[FIX] ${fix}`
      ]);
    }

    setInstruction('');
  };

  const copyToClipboard = () => {
    const text = generatedProject?.files.find(f => f.name === selectedFile)?.content;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveToLocalPC = async () => {
    if (!generatedProject) return;
    try {
      const response = await fetch('http://localhost:3001/api/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: generatedProject.title,
          files: generatedProject.files.map(f => ({ path: f.name, content: f.content }))
        })
      });
      const data = await response.json();
      if (data.success) {
        setLogs(l => [...l, `[SUCCESS] Project saved to local disk: ${data.path}`]);
        setLastSavedPath(data.path);
        alert(`Saved locally to: \n${data.path}`);
      } else { throw new Error(data.error); }
    } catch (e: any) {
      alert('Failed to save locally. Is the Local Backend (server.js) running? Restart via start.bat');
      setLogs(l => [...l, `[ERROR] Local Save Failed: ${e.message}`]);
    }
  };

  const compileProject = async () => {
    if (!lastSavedPath) {
      alert("Please Save the project to Hard Drive first!");
      return;
    }
    setLogs(l => [...l, `[COMPILER] Initiating engine build sequence...`]);
    try {
      const response = await fetch('http://localhost:3001/api/compile-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: lastSavedPath, engine: instruction.toLowerCase().includes('godot') ? 'GODOT' : 'UNITY' })
      });
      const data = await response.json();
      if (data.success) {
        setLogs(l => [...l, `[SUCCESS] Build Compiled Successfully at: ${data.buildPath}`]);
        alert(`Compilation successful! Executable is ready at:\n${data.buildPath}`);
      } else { throw new Error(data.error); }
    } catch (e: any) {
      setLogs(l => [...l, `[ERROR] Build Failed: Ensure Game Engine is installed and in your Windows PATH.`]);
    }
  };

  const expandProject = async () => {
    if (!generatedProject) return;
    const fallbackProfiles: Array<{ apiKey: string, apiConfig: any, sourceName: string }> = [];
    const addedKeys = new Set<string>();

    const addProfile = (key: string, config: any, sourceName: string) => {
      if (key && typeof key === 'string' && key.trim() !== '' && !addedKeys.has(key.trim())) {
        fallbackProfiles.push({ apiKey: key.trim(), apiConfig: config, sourceName });
        addedKeys.add(key.trim());
      }
    };

    addProfile(agentKeys['global'] || process.env.GEMINI_API_KEY || '', apiConfig, 'Global Key');
    for (const [keyId, keyVal] of Object.entries(agentKeys)) {
      if (keyId !== 'global' && keyId !== 'meshy' && keyId !== 'luma' && keyId !== 'elevenlabs' && keyId !== 'github_token') {
         addProfile(keyVal as string, agentApiConfigs[keyId] || apiConfig, `${keyId} Key`);
      }
    }
    if (fallbackProfiles.length === 0) {
      alert("SYSTEM HALTED: No Global API Key found. Please click the Settings gear icon and add your API Key first!");
      return;
    }
    setLogs(l => [...l, `[DEEP FORGE] Initiating Token Limit Bypass... Generating next architectural chunk.`]);
    setIsDeploying(true);

    try {
      const existingFiles = generatedProject.files.map(f => f.name).join(', ');
      const prompt = `AAA DEEP FORGE EXPANSION: We are iteratively building a massive open-world game.
      Current files generated so far: ${existingFiles}.
      Generate the NEXT highly advanced FULLY PLAYABLE features required (e.g., Smart Enemy AI with pathfinding, Weapon Systems with recoil, Inventory UI). Ensure these new scripts seamlessly integrate with the existing scene.
      Output MUST be a SINGLE JSON array of objects with "name" (file path) and "content" (production-ready source code). Example: [{"name": "Assets/Scripts/AdvancedEnemy.cs", "content": "..."}]`;

      let generatedText = '';
      const MAX_RETRIES = 5;
      let attempt = 0;
      let profileIndex = 0;

      while (attempt < MAX_RETRIES) {
        attempt++;
        const currentProfile = fallbackProfiles[profileIndex];
        const apiKey = currentProfile.apiKey;
        const currentApiConfig = currentProfile.apiConfig;
        try {
          if (currentApiConfig.provider === 'gemini') {
            const geminiModel = currentApiConfig.model || 'gemini-1.5-flash';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API request failed');
            generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            const baseUrl = (currentApiConfig.baseUrl || '').trim().replace(/\/$/, '');
            let modelName = (currentApiConfig.model || '').trim();
            if (modelName.includes('safety-guard')) modelName = 'meta/llama3-70b-instruct';
            try {
              const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
                body: JSON.stringify({ 
                  model: modelName, 
                  messages: [{ role: 'user', content: prompt }],
                  ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {})
                })
              });
              const data = await response.json();
              if (!response.ok) {
                const errorMsg = data.error?.message || data.detail || data.message || data.error || `API request failed: ${response.status}`;
                throw new Error(errorMsg);
              }
              generatedText = data.choices?.[0]?.message?.content || '';
            } catch (fetchErr: any) {
              if (fetchErr.message === 'Failed to fetch' || fetchErr.message.includes('NetworkError')) {
                const proxyRes = await fetch('http://localhost:3001/api/proxy/chat', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    url: `${baseUrl}/chat/completions`, 
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` }, 
                    body: { model: modelName, messages: [{ role: 'user', content: prompt }], ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {}) } 
                  })
                });
                const data = await proxyRes.json();
                if (!proxyRes.ok) {
                  const errorMsg = data.error?.message || data.detail || data.message || data.error || `API request failed: ${proxyRes.status}`;
                  throw new Error(errorMsg);
                }
                if (data.error && data.error.message) throw new Error(data.error.message);
                generatedText = data.choices?.[0]?.message?.content || '';
              } else {
                throw fetchErr;
              }
            }
          }
          break;
        } catch (error: any) {
          const errMsg = error.message || String(error);
          const isFallbackable = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota") || errMsg.includes("401") || errMsg.includes("403") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("key") || errMsg.includes("models/") || errMsg.toLowerCase().includes("not found");
          if (isFallbackable && profileIndex < fallbackProfiles.length - 1) {
             profileIndex++;
             setLogs(l => [...l.slice(-15), `[SYSTEM] API issue detected. Seamlessly switching to ${fallbackProfiles[profileIndex].sourceName}...`]);
             attempt--; 
             continue; 
          }
          const isHighDemand = errMsg.includes("503") || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded");
          
          if (isHighDemand && attempt < MAX_RETRIES) {
            setLogs(l => [...l.slice(-15), `[SYSTEM] High Demand (503) in Deep Forge. Auto-retrying attempt ${attempt}/${MAX_RETRIES}...`]);
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000 + Math.random() * 1000));
          } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota")) {
            throw new Error("429_QUOTA_EXHAUSTED");
          } else {
            throw error;
          }
        }
      }

      try {
        let jsonContent = generatedText.replace(/```(?:json)?\n?/i, '').replace(/```/g, '').trim();
        const startIndex = jsonContent.indexOf('[');
        const endIndex = jsonContent.lastIndexOf(']');
        if(startIndex !== -1 && endIndex !== -1) jsonContent = jsonContent.substring(startIndex, endIndex + 1);
        
        const newFiles = JSON.parse(jsonContent);
        const parsedNewFiles = newFiles.map((f: any) => ({ name: f.name || f.path || 'UnknownFile.txt', content: f.content || '', language: f.name?.split('.').pop() || 'text' }));

        setGeneratedProject(prev => prev ? { ...prev, files: [...prev.files, ...parsedNewFiles] } : null);
        setLogs(l => [...l, `[SUCCESS] Deep Forge successfully injected ${parsedNewFiles.length} new modules into the project!`]);
        setSelectedFile(parsedNewFiles[0]?.name || 'index.html');
        setLastSavedPath(null); // Force user to save the new files before compiling
      } catch (e: any) {
        throw new Error("Failed to parse JSON array from AI output.");
      }
    } catch (error: any) {
      setLogs(l => [...l, `[ERROR] Deep Forge Expansion Failed: ${error.message}`]);
    }
    setIsDeploying(false);
  };

  const downloadProject = async () => {
    if (!generatedProject) return;
    
    const zip = new JSZip();
    generatedProject.files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedProject.title.replace(/\s+/g, '_').toLowerCase()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2 font-display">
            <Activity className="text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">YOUKTA SWARM FACTORY</span>
          </h1>
        </div>
          <div className="flex gap-4 sm:gap-8 items-center">
            {/* Turbo Boost Toggle */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Zap size={14} className={isBoostEnabled ? "text-amber-500 fill-amber-500" : "text-zinc-400"} />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Turbo</span>
              </div>
              <button 
                onClick={() => setIsBoostEnabled(!isBoostEnabled)}
                className={cn(
                  "w-10 h-5 rounded-full p-1 transition-all",
                  isBoostEnabled ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
                )}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: isBoostEnabled ? 20 : 0 }}
                />
              </button>
            </div>

            {/* View Toggle */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('orchestrator')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2",
                viewMode === 'orchestrator' ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-500" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Hexagon size={14} />
              ROBOT VIEW
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2",
                viewMode === 'preview' ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-500" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Layout size={14} />
              SEE APP
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2",
                viewMode === 'code' ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-500" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Code size={14} />
              SOURCE CODE
            </button>
          </div>

          {/* Polyglot Mode Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <Cpu size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Auto-Polyglot Mode</span>
          </div>



          {/* Difficulty Toggle */}
          <div className="hidden lg:flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  difficulty === level 
                    ? `${difficultyConfig[level].bg} ${difficultyConfig[level].color} shadow-sm` 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {level}
              </button>
            ))}
          </div>

          {isDeploying && (
            <div className="hidden md:flex flex-col items-end w-32 lg:w-48">
              <div className="flex justify-between w-full mb-1">
                <span className="text-[9px] font-mono text-blue-500">CREATING...</span>
                <span className="text-[9px] font-mono text-zinc-500">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="bg-blue-500 h-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => {
                setIsSettingsOpen(true);
                setIsSettingsMinimized(false);
              }}
              className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors group"
              title="System Settings"
            >
              <Settings size={14} className="text-zinc-500 group-hover:rotate-45 transition-transform" />
            </button>
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <Activity size={14} className="text-zinc-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Factory View */}
      <main className="flex-1 relative overflow-auto p-4 sm:p-8 md:p-12 flex flex-col items-center" ref={containerRef}>
        <AnimatePresence mode="wait">
          {viewMode === 'orchestrator' ? (
            <motion.div 
              key="orchestrator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full flex flex-col items-center"
            >
              {/* Connection Wires */}
              {allConnections.map((conn, idx) => (
                <ConnectionLine 
                  key={`${conn.from}-${conn.to}-${idx}`} 
                  fromId={conn.from} 
                  toId={conn.to} 
                  containerRef={containerRef}
                  dragTrigger={dragTrigger}
                  isActive={isDeploying}
                />
              ))}

              {/* Hierarchical Grid */}
              <div className="relative z-10 flex flex-wrap justify-center items-center gap-6 py-12 w-full max-w-6xl mx-auto px-4 min-h-[300px]">
                {levels.flatMap(([_, agents]) => agents).map(agent => (
                      <AgentCard 
                        key={agent.id} 
                        agent={agent} 
                        onClick={() => setSelectedAgent(agent)}
                        isActive={selectedAgent?.id === agent.id}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        isOrchestrating={isDeploying}
                      />
                    ))}
              </div>
            </motion.div>
          ) : viewMode === 'preview' ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl h-full flex flex-col min-h-[700px]"
            >
              {generatedProject ? (
                <div className="flex flex-col h-full gap-4">
                  {/* Top Bar controls */}
                  <div className="flex flex-wrap items-center justify-between bg-zinc-100 dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex bg-zinc-200/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-inner">
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={cn("p-2 rounded-lg transition-all duration-300", previewDevice === 'desktop' ? "bg-white dark:bg-zinc-700 shadow-md text-blue-500 scale-105" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200")}
                          title="Desktop View"
                        >
                          <Monitor size={16} />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile-portrait')}
                          className={cn("p-2 rounded-lg transition-all duration-300", previewDevice === 'mobile-portrait' ? "bg-white dark:bg-zinc-700 shadow-md text-blue-500 scale-105" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200")}
                          title="Mobile Portrait"
                        >
                          <Smartphone size={16} />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile-landscape')}
                          className={cn("p-2 rounded-lg transition-all duration-300", previewDevice === 'mobile-landscape' ? "bg-white dark:bg-zinc-700 shadow-md text-blue-500 scale-105" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200")}
                          title="Mobile Landscape"
                        >
                          <Smartphone size={16} className="rotate-90" />
                        </button>
                      </div>
                      <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700" />
                      <button 
                        onClick={() => {
                          const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                          if (iframe) iframe.srcdoc = iframe.srcdoc; // trigger reload
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 uppercase tracking-widest"
                      >
                        <RefreshCcw size={14} /> Restart App
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Instance
                      </div>
                      <button 
                        onClick={() => {
                          setIsModifyMode(true);
                          setInstruction(`Change: `);
                          setTimeout(() => {
                            const input = document.querySelector('input');
                            input?.focus();
                          }, 100);
                        }}
                        className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                      >
                        <Code size={14} /> Modify Code
                      </button>
                      <button 
                        onClick={() => {
                          const doc = generatedProject?.files.find(f => f.name.endsWith('index.html'))?.content;
                          if (doc) {
                            const blob = new Blob([doc], {type: 'text/html'});
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors"
                      >
                        <ExternalLink size={14} /> Open Fullscreen
                      </button>
                    </div>
                  </div>

                  {/* Sandbox Container */}
                  <div className="flex-1 bg-zinc-200/50 dark:bg-[#0a0a0a] rounded-[2rem] border border-zinc-300 dark:border-zinc-800 flex items-center justify-center p-4 lg:p-8 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative shadow-inner">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(black_1px,transparent_1px)] dark:bg-[radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]" />
                    
                    <div className={cn(
                      "relative transition-all duration-500 active:transition-none shadow-2xl overflow-hidden flex flex-col shrink-0 mx-auto group/preview",
                      previewDevice === 'desktop' 
                        ? "w-[800px] h-[600px] max-w-[95%] max-h-[95%] min-w-[300px] min-h-[200px] rounded-2xl border border-zinc-200 dark:border-zinc-700 resize bg-zinc-100 dark:bg-zinc-800" 
                        : previewDevice === 'mobile-portrait'
                        ? "w-[375px] h-[812px] rounded-[3rem] border-[14px] border-zinc-900 dark:border-black bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        : "w-[812px] h-[375px] rounded-[3rem] border-[14px] border-zinc-900 dark:border-black bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    )}>
                      {previewDevice === 'desktop' && (
                        <div className="h-10 bg-zinc-200/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-300 dark:border-zinc-800 flex items-center px-4 gap-3 shrink-0">
                          <div className="flex gap-1.5 shrink-0">
                            <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-inner" />
                          </div>
                          <div className="mx-auto flex-1 max-w-sm px-4 py-1.5 rounded-lg bg-white/50 dark:bg-black/40 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2 border border-zinc-300 dark:border-white/5 shadow-inner">
                            <Lock size={12} className="text-emerald-500" /> localhost:3000
                          </div>
                          <div className="w-12 shrink-0" />
                        </div>
                      )}

                      {previewDevice !== 'desktop' && (
                        <>
                          <div className={cn("absolute bg-zinc-900 dark:bg-black z-20 pointer-events-none", previewDevice === 'mobile-portrait' ? "top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl" : "left-0 top-1/2 -translate-y-1/2 w-6 h-32 rounded-r-2xl")} />
                          <div className={cn("absolute bg-zinc-300 dark:bg-zinc-800 rounded-full z-20 pointer-events-none", previewDevice === 'mobile-portrait' ? "bottom-2 left-1/2 -translate-x-1/2 w-32 h-1" : "right-2 top-1/2 -translate-y-1/2 w-1 h-32")} />
                        </>
                      )}
                      
                      {(() => {
                         let doc = generatedProject?.files.find(f => f.name.endsWith('index.html'))?.content || '<div style="font-family:sans-serif; color:black; padding:40px; text-align:center; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#ffffff;"><h2>Desktop Engine Detected</h2><p>Unity/Godot scenes cannot be run directly in this web sandbox.</p><p>Click "Compile to .EXE" from the Source Code panel to build the real executable!</p></div>';
                         if (doc.includes('<head>') && !doc.includes('meta name="viewport"')) {
                           doc = doc.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">');
                         }
                         if (doc.includes('<head>')) {
                           doc = doc.replace('<head>', '<head>\n<style>\n/* Hide scrollbar */\n::-webkit-scrollbar { display: none; }\n* { -ms-overflow-style: none; scrollbar-width: none; }\n</style>');
                         }
                         return (
                          <iframe 
                            id="preview-iframe"
                            srcDoc={doc}
                            className="w-full h-full border-0 flex-1 z-10 bg-white group-active/preview:pointer-events-none"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
                            title="Generated App Sandbox"
                          />
                         );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 p-20 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-300 dark:border-zinc-800 h-full flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group/empty">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover/empty:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="h-24 w-24 rounded-[2.5rem] bg-zinc-200/80 dark:bg-zinc-800/80 flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                    <Monitor size={40} className="text-zinc-400" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-zinc-800 dark:text-zinc-200">Sandbox Environment</h3>
                  <p className="text-sm text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">Generate a game or app to test it directly in this live device simulator.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-6xl flex gap-6 h-[700px]"
            >
              <div className="w-64 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2">Files</h3>
                  <div className="space-y-1">
                    {isDeploying ? (
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <Loader2 size={16} className="animate-spin" />
                          Generating...
                        </div>
                      </button>
                    ) : generatedProject ? (
                      generatedProject.files.map(file => (
                        <button
                          key={file.name}
                          onClick={() => setSelectedFile(file.name)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                            selectedFile === file.name 
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                              : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          )}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FileCode size={16} className="shrink-0" />
                            <div className="flex flex-col items-start truncate">
                              {file.name.includes('/') ? (
                                <>
                                  <span className={cn("text-[9px] uppercase tracking-widest", selectedFile === file.name ? "text-blue-200" : "text-zinc-400")}>
                                    {file.name.split('/').slice(0, -1).join('/')}/
                                  </span>
                                  <span className="truncate">{file.name.split('/').pop()}</span>
                                </>
                              ) : (
                                <span className="truncate">{file.name}</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={14} className={cn("shrink-0", selectedFile === file.name ? "opacity-100" : "opacity-0")} />
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-2 opacity-30">
                        <FileText size={24} className="mx-auto" />
                        <p className="text-[8px] uppercase font-black">Waiting for input</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto p-4 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-300 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase text-zinc-500">
                    <Activity size={12} className="text-emerald-500" />
                    System Status
                  </div>
                  <div className="font-mono text-xs text-blue-500 flex justify-between">
                    <span>Verified</span>
                    <span className="text-emerald-500 underline decoration-dotted">100% Secure</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="w-[1px] h-4 bg-zinc-800 mx-2" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{isDeploying ? 'building_source.js' : selectedFile} — Swarm Intelligence v2.0</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight">ReadOnly</div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                      title="Copy Code"
                    >
                      <Code size={16} />
                      <span className="text-[10px] font-bold">{copied ? 'COPIED!' : 'COPY'}</span>
                    </button>
                    {generatedProject && (
                      <button onClick={saveToLocalPC} className="p-2 hover:bg-zinc-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors" title="Save Direct to Hard Drive">
                        <HardDrive size={16} />
                      </button>
                    )}
                    {lastSavedPath && (instruction.toLowerCase().includes('unity') || instruction.toLowerCase().includes('godot')) && (
                      <button onClick={compileProject} className="p-2 hover:bg-zinc-800 rounded-lg text-purple-400 hover:text-purple-300 transition-colors" title="Compile to .EXE (Requires Engine)">
                        <Hammer size={16} />
                      </button>
                    )}
                    {generatedProject && (instruction.toLowerCase().includes('unity') || instruction.toLowerCase().includes('godot') || instruction.toLowerCase().includes('open world')) && (
                      <button onClick={expandProject} className="p-2 hover:bg-zinc-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors" title="Deep Forge Expansion (Auto-generate next game module)">
                        <FolderPlus size={16} />
                      </button>
                    )}
                    {generatedProject && (
                      <button 
                        onClick={downloadProject}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="Download Project ZIP"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div ref={codeContainerRef} className="flex-1 overflow-auto selection:bg-blue-500/30 custom-scrollbar bg-zinc-950">
                  {isDeploying ? (
                    <SyntaxHighlighter
                      language="html"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '2rem',
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {streamingCode}
                    </SyntaxHighlighter>
                  ) : generatedProject ? (
                    <SyntaxHighlighter
                      language={generatedProject.files.find(f => f.name === selectedFile)?.language || 'javascript'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '2rem',
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {generatedProject.files.find(f => f.name === selectedFile)?.content || ''}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="p-8 font-mono text-[13px] text-zinc-500">
                      <span className="text-zinc-600">// AI is waiting for your task...</span><br />
                      <span className="text-zinc-600">// Use the input bar at the bottom to start.</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar Details Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-6 sm:p-8 flex flex-col"
            >
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <Layout size={20} className="rotate-45" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 relative">
                {selectedAgent.id === 'ceo' && selectedAgent.status === 'active' && (
                  <motion.div 
                    className="absolute inset-0 bg-emerald-500/20 rounded-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {React.createElement(ICON_MAP[selectedAgent.icon] || Hexagon, { size: 32, className: "relative z-10" })}
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Level {selectedAgent.level} Agent</span>
                <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
              </div>
            </div>

            <div className="space-y-6">
              {isDeploying && (selectedAgent.level <= 2) && (
                <section className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl animate-pulse">
                  <h3 className="text-[10px] font-mono text-amber-500 uppercase mb-1">New Directive Processing</h3>
                  <p className="text-xs italic text-amber-600 dark:text-amber-400">"{instruction || 'Orchestrating system resources...'}"</p>
                </section>
              )}
              <section>
                <h3 className="text-xs font-mono uppercase text-zinc-500 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">Primary Objective</h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {selectedAgent.description}
                </p>
              </section>

              <section className={cn("p-4 rounded-xl border transition-colors", difficultyConfig[difficulty].bg, difficultyConfig[difficulty].border)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn("text-[10px] font-bold uppercase", difficultyConfig[difficulty].color)}>
                    {difficulty} Mode Active
                  </h3>
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", difficultyConfig[difficulty].bg.replace('10', '50'))} />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  System parameters scaled for <strong>{difficultyConfig[difficulty].label}</strong> deployment.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/40 dark:bg-black/20 p-2 rounded-lg">
                    <span className="block text-[8px] text-zinc-500 uppercase">AI Precision</span>
                    <span className="text-xs font-mono font-bold">
                      {difficulty === 'HARD' ? '99.9%' : difficulty === 'MEDIUM' ? '94.2%' : '82.0%'}
                    </span>
                  </div>
                  <div className="bg-white/40 dark:bg-black/20 p-2 rounded-lg">
                    <span className="block text-[8px] text-zinc-500 uppercase">Swarm Sync</span>
                    <span className="text-xs font-mono font-bold">
                      {difficulty === 'HARD' ? 'High Burst' : difficulty === 'MEDIUM' ? 'Standard' : 'Low Power'}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-mono uppercase text-zinc-500 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-1">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.specialty.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
              <section className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-blue-500" />
                  <h3 className="text-xs font-bold text-blue-500 uppercase">Training Dashboard</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-zinc-500 uppercase">Production Protocol</span>
                      <span className="text-emerald-500">OPTIMIZED</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="bg-emerald-500 h-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-zinc-500 uppercase">Enterprise IQ</span>
                      <span className="text-blue-400">98.4%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "98.4%" }}
                        className="bg-blue-500 h-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-zinc-100 dark:bg-black/40 rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Neural Latency</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">0.02ms</span>
                  </div>
                </div>
              </section>

              
            </div>

            <div className="mt-auto">
              <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                RESTART ROBOT
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Command Bar */}
      <AnimatePresence>
        {!isCommandBarMinimized ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
          >
            <div className="relative group/bar">
              <button 
                onClick={() => setIsCommandBarMinimized(true)}
                className="absolute -top-3 right-4 opacity-0 group-hover/bar:opacity-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 shadow-md hover:text-blue-500 transition-all z-50 text-zinc-400"
                title="Minimize Command Bar"
              >
                <Minimize2 size={12} />
              </button>
              <form 
                onSubmit={handleSendCommand}
                className={cn(
                  "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-2 p-2 rounded-2xl shadow-2xl flex items-center gap-2 transition-all",
                  isModifyMode ? "border-blue-500 shadow-blue-500/20" : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                <div className="pl-4 pr-2">
                  {isModifyMode ? <Code size={18} className="text-blue-500" /> : <Activity size={18} className={cn(isDeploying ? "text-blue-500 animate-spin" : "text-zinc-400")} />}
                </div>
                <input 
                  type="text" 
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder={isModifyMode ? "Tell me what to change in the game..." : `e.g. ${SUGGESTED_PROMPTS[placeholderIndex]}`}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
                />
                {isModifyMode && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsModifyMode(false);
                      setInstruction('');
                    }}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                {!isModifyMode && !isDeploying && (
                  <button 
                    type="button"
                    onClick={() => setInstruction(SUGGESTED_PROMPTS[Math.floor(Math.random() * SUGGESTED_PROMPTS.length)])}
                    className="p-2 text-zinc-400 hover:text-amber-500 transition-colors bg-zinc-100 dark:bg-zinc-800 rounded-lg mx-1"
                    title="Suggest a Game Idea"
                  >
                    <Sparkles size={16} />
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isDeploying || !instruction.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      BUILDING NOW...
                    </>
                  ) : (
                    isModifyMode ? 'UPDATE' : 'START BUILDING'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <button
              onClick={() => setIsCommandBarMinimized(false)}
              className="bg-zinc-900 dark:bg-white text-white dark:text-black w-12 h-12 rounded-full shadow-2xl border border-white/10 dark:border-black/10 flex items-center justify-center hover:scale-110 transition-transform group relative"
              title="Restore Command Terminal"
            >
              <Maximize2 size={18} />
              <span className="absolute right-14 bg-zinc-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                Restore Terminal
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md flex justify-center items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        <Activity size={14} className="opacity-20" />
      </footer>

      {/* Settings Modal & Minimized Panel */}
      <AnimatePresence>
        {isSettingsOpen && !isSettingsMinimized && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">System Controls</h2>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">AI Settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsSettingsMinimized(true)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    title="Minimize"
                  >
                    <Minimize2 size={18} />
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-rose-500"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 h-[450px] overflow-y-auto space-y-6 custom-scrollbar">
                <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Server size={10} className="text-indigo-500" />
                    AI Provider Configuration
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setApiConfig({provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash'})} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border uppercase", apiConfig.provider === 'gemini' ? "bg-blue-500/10 border-blue-500 text-blue-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Gemini (Default)</button>
                    <button onClick={() => setApiConfig({provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct'})} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border uppercase", apiConfig.provider === 'nvidia' ? "bg-green-500/10 border-green-500 text-green-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>NVIDIA NIM</button>
                    <button onClick={() => setApiConfig({provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile'})} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border uppercase", apiConfig.provider === 'groq' ? "bg-orange-500/10 border-orange-500 text-orange-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Groq API</button>
                    <button onClick={() => setApiConfig({provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini'})} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border uppercase", apiConfig.provider === 'custom' ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Custom OpenAI</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {apiConfig.provider !== 'gemini' && (
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2 block">Base URL</label>
                        <input type="text" value={apiConfig.baseUrl} onChange={e => setApiConfig({...apiConfig, baseUrl: e.target.value.replace(/base_url\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-indigo-500 transition-all text-indigo-500" placeholder="https://api.openai.com/v1" />
                      </div>
                    )}
                    <div className={apiConfig.provider === 'gemini' ? "col-span-2" : ""}>
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2 block">Model Name</label>
                      {apiConfig.provider === 'gemini' ? (
                        <select value={apiConfig.model || 'gemini-1.5-flash'} onChange={e => setApiConfig({...apiConfig, model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-blue-500 transition-all text-blue-500">
                          <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Stable)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced)</option>
                          <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-3.0-pro">Gemini 3.0 Pro</option>
                          <option value="gemini-3.1-flash">Gemini 3.1 Flash Preview</option>
                        </select>
                      ) : apiConfig.provider === 'nvidia' ? (
                        <select value={apiConfig.model || 'meta/llama3-70b-instruct'} onChange={e => setApiConfig({...apiConfig, model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-green-500 transition-all text-green-500">
                          <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B Instruct</option>
                          <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B Instruct</option>
                          <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B Instruct</option>
                          <option value="deepseek-ai/deepseek-v4-pro">DeepSeek V4 Pro</option>
                          <option value="deepseek-ai/deepseek-r1">DeepSeek R1</option>
                          <option value="meta/llama3-70b-instruct">Llama 3 70B Instruct</option>
                          <option value="meta/llama3-8b-instruct">Llama 3 8B Instruct</option>
                          <option value="mistralai/mixtral-8x22b-instruct-v0.1">Mixtral 8x22B Instruct</option>
                          <option value="mistralai/mistral-large-instruct-2402">Mistral Large Instruct</option>
                          <option value="google/gemma-2-27b-it">Gemma 2 27B IT</option>
                          <option value="google/gemma-2-9b-it">Gemma 2 9B IT</option>
                        </select>
                      ) : apiConfig.provider === 'groq' ? (
                        <select value={apiConfig.model || 'llama-3.1-70b-versatile'} onChange={e => setApiConfig({...apiConfig, model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-orange-500 transition-all text-orange-500">
                          <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                          <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                          <option value="llama3-70b-8192">Llama 3 70B</option>
                          <option value="llama3-8b-8192">Llama 3 8B</option>
                          <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                          <option value="gemma2-9b-it">Gemma 2 9B IT</option>
                        </select>
                      ) : (
                        <input type="text" value={apiConfig.model} onChange={e => setApiConfig({...apiConfig, model: e.target.value.replace(/model\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-indigo-500 transition-all text-indigo-500" placeholder="gpt-4o-mini" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Hexagon size={10} className="text-blue-500" />
                    Main API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck size={14} className="text-zinc-400" />
                    </div>
                    <input 
                      type="password"
                      value={agentKeys['global'] || ''}
                      placeholder="Global fallback key..."
                      onChange={(e) => handleUpdateAgentKey('global', e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())}
                      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-mono"
                    />
                  </div>
                      {agentKeys['global'] === 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM' && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-3 shadow-lg shadow-emerald-500/5">
                          <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gemini API Project Linked</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="flex flex-col gap-1">
                              <span className="text-zinc-500 uppercase tracking-widest text-[8px]">Project Name</span>
                              <span className="text-emerald-300">projects/336042062988</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-zinc-500 uppercase tracking-widest text-[8px]">Project Number</span>
                              <span className="text-emerald-300">336042062988</span>
                            </div>
                            <div className="col-span-2 flex flex-col gap-1 mt-1">
                              <span className="text-zinc-500 uppercase tracking-widest text-[8px]">API Key Name</span>
                              <span className="text-blue-400 truncate">Gemini API Key</span>
                            </div>
                          </div>
                        </div>
                      )}
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Box size={10} className="text-purple-500" />
                    Asset Generation APIs (3D/Audio)
                  </label>
                  <div className="space-y-2">
                    <input type="password" value={agentKeys['meshy'] || ''} onChange={(e) => handleUpdateAgentKey('meshy', e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())} placeholder="Meshy API Key (3D Models)" className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-purple-500/50 transition-all font-mono" />
                    <input type="password" value={agentKeys['luma'] || ''} onChange={(e) => handleUpdateAgentKey('luma', e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())} placeholder="Luma AI Key (Environments)" className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-purple-500/50 transition-all font-mono" />
                    <input type="password" value={agentKeys['elevenlabs'] || ''} onChange={(e) => handleUpdateAgentKey('elevenlabs', e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())} placeholder="ElevenLabs Key (Voice/SFX)" className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-purple-500/50 transition-all font-mono" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Zap size={10} className="text-emerald-500" />
                    Individual Settings
                  </label>
                  
                  <div className="grid gap-3">
                    {AGENTS.map((agent) => (
                  <div key={agent.id} className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                        <Activity size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold truncate pr-2 uppercase tracking-tight">{agent.name}</span>
                            {agentKeys[agent.id] ? (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-bold">Active Override</span>
                            ) : (
                              <span className="text-[8px] bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold">Using Global</span>
                            )}
                          </div>
                          <div className="relative">
                            <input 
                              type="password"
                              value={agentKeys[agent.id] || ''}
                              placeholder={`${agent.id} api key...`}
                              onChange={(e) => handleUpdateAgentKey(agent.id, e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3 text-[10px] outline-none focus:border-blue-500/30 transition-all font-mono"
                            />
                            {agentKeys[agent.id] && (
                              <button 
                                onClick={() => handleUpdateAgentKey(agent.id, '')}
                                className="absolute right-2 inset-y-0 flex items-center text-zinc-400 hover:text-rose-500 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateAgentApiConfig(agent.id, null)} className={cn("flex-1 py-1.5 rounded-md text-[9px] font-bold border uppercase transition-all", !agentApiConfigs[agent.id] ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Inherit</button>
                          <button onClick={() => handleUpdateAgentApiConfig(agent.id, {provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash'})} className={cn("flex-1 py-1.5 rounded-md text-[9px] font-bold border uppercase transition-all", agentApiConfigs[agent.id]?.provider === 'gemini' ? "bg-blue-500/10 border-blue-500 text-blue-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Gemini</button>
                          <button onClick={() => handleUpdateAgentApiConfig(agent.id, {provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct'})} className={cn("flex-1 py-1.5 rounded-md text-[9px] font-bold border uppercase transition-all", agentApiConfigs[agent.id]?.provider === 'nvidia' ? "bg-green-500/10 border-green-500 text-green-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>NVIDIA</button>
                          <button onClick={() => handleUpdateAgentApiConfig(agent.id, {provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile'})} className={cn("flex-1 py-1.5 rounded-md text-[9px] font-bold border uppercase transition-all", agentApiConfigs[agent.id]?.provider === 'groq' ? "bg-orange-500/10 border-orange-500 text-orange-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Groq</button>
                          <button onClick={() => handleUpdateAgentApiConfig(agent.id, {provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini'})} className={cn("flex-1 py-1.5 rounded-md text-[9px] font-bold border uppercase transition-all", agentApiConfigs[agent.id]?.provider === 'custom' ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>Custom</button>
                        </div>
                        {agentApiConfigs[agent.id] && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {agentApiConfigs[agent.id].provider !== 'gemini' && (
                              <input type="text" value={agentApiConfigs[agent.id].baseUrl} onChange={e => handleUpdateAgentApiConfig(agent.id, {...agentApiConfigs[agent.id], baseUrl: e.target.value.replace(/base_url\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} placeholder="Base URL" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-2 text-[9px] font-mono outline-none text-indigo-500 transition-all focus:border-indigo-500" />
                            )}
                            <div className={agentApiConfigs[agent.id].provider === 'gemini' ? "col-span-2" : ""}>
                              {agentApiConfigs[agent.id].provider === 'gemini' ? (
                                <select value={agentApiConfigs[agent.id].model || 'gemini-1.5-flash'} onChange={e => handleUpdateAgentApiConfig(agent.id, {...agentApiConfigs[agent.id], model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-2 text-[9px] font-mono outline-none text-blue-500 transition-all focus:border-blue-500">
                                  <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                  <option value="gemini-3.0-pro">Gemini 3.0 Pro</option>
                                  <option value="gemini-3.1-flash">Gemini 3.1 Flash</option>
                                </select>
                              ) : agentApiConfigs[agent.id].provider === 'nvidia' ? (
                                <select value={agentApiConfigs[agent.id].model || 'meta/llama3-70b-instruct'} onChange={e => handleUpdateAgentApiConfig(agent.id, {...agentApiConfigs[agent.id], model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-2 text-[9px] font-mono outline-none text-green-500 transition-all focus:border-green-500">
                                  <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B</option>
                                  <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                                  <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                                  <option value="deepseek-ai/deepseek-v4-pro">DeepSeek V4 Pro</option>
                                  <option value="deepseek-ai/deepseek-r1">DeepSeek R1</option>
                                  <option value="meta/llama3-70b-instruct">Llama 3 70B</option>
                                  <option value="meta/llama3-8b-instruct">Llama 3 8B</option>
                                  <option value="mistralai/mixtral-8x22b-instruct-v0.1">Mixtral 8x22B</option>
                                  <option value="google/gemma-2-27b-it">Gemma 2 27B</option>
                                </select>
                              ) : agentApiConfigs[agent.id].provider === 'groq' ? (
                                <select value={agentApiConfigs[agent.id].model || 'llama-3.1-70b-versatile'} onChange={e => handleUpdateAgentApiConfig(agent.id, {...agentApiConfigs[agent.id], model: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-2 text-[9px] font-mono outline-none text-orange-500 transition-all focus:border-orange-500">
                                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B</option>
                                  <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
                                  <option value="llama3-70b-8192">Llama 3 70B (Legacy)</option>
                                  <option value="llama3-8b-8192">Llama 3 8B (Legacy)</option>
                                  <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                                  <option value="gemma2-9b-it">Gemma 2 9B</option>
                                </select>
                              ) : (
                                <input type="text" value={agentApiConfigs[agent.id].model} onChange={e => handleUpdateAgentApiConfig(agent.id, {...agentApiConfigs[agent.id], model: e.target.value.replace(/model\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} placeholder="Model Name" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-2 text-[9px] font-mono outline-none text-indigo-500 transition-all focus:border-indigo-500" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => {
                    localStorage.setItem('youkta_api_config', JSON.stringify(apiConfig));
                    setIsSettingsOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 uppercase"
                >
                  Save & Start
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isSettingsOpen && isSettingsMinimized && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 flex items-center gap-3 pr-4">
              <div className="p-2 rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                <Settings size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-tight">System Running</span>
                <span className="text-[8px] font-mono text-zinc-500 uppercase">{Object.keys(agentKeys).length} Keys Configured</span>
              </div>
              <div className="h-6 w-[1px] bg-zinc-100 dark:bg-zinc-800 mx-1" />
              <div className="flex gap-1">
                <button 
                  onClick={() => setIsSettingsMinimized(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-blue-500 transition-colors"
                  title="Maximize"
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-rose-500 transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Live Terminal */}
      <div className={cn(
        "fixed z-50 transition-all duration-500 pointer-events-auto",
        isTerminalMinimized 
          ? "bottom-8 -left-2 w-12 opacity-40 hover:opacity-100 hover:left-0" 
          : isTerminalExpanded
            ? "bottom-8 left-8 right-8 md:right-auto md:w-[600px] lg:w-[800px]"
            : "bottom-8 left-8 w-80 sm:w-96"
      )}>
        <div className="bg-zinc-950/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <div 
            className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 cursor-pointer min-h-[36px]" 
            onClick={() => {
              if (isTerminalMinimized) setIsTerminalMinimized(false);
              else setIsTerminalExpanded(!isTerminalExpanded);
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Terminal size={12} className={cn("shrink-0", isDeploying ? "text-emerald-500 animate-pulse" : "text-emerald-500")} />
              {!isTerminalMinimized && (
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Global System Console</span>
              )}
            </div>
            <div className="flex gap-2 items-center shrink-0">
              {isDeploying && !isTerminalMinimized && (
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-2 bg-emerald-500/50 animate-bounce [animation-delay:0.1s]" />
                  <div className="w-0.5 h-2 bg-emerald-500/50 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-0.5 h-2 bg-emerald-500/50 animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
              {!isTerminalMinimized && (
                <button 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTerminalExpanded(!isTerminalExpanded);
                  }}
                  title={isTerminalExpanded ? "Collapse" : "Expand"}
                >
                  {isTerminalExpanded ? <Minimize2 size={12} className="text-zinc-500" /> : <Maximize2 size={12} className="text-zinc-500" />}
                </button>
              )}
              <button 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTerminalMinimized(!isTerminalMinimized);
                  if (!isTerminalMinimized) setIsTerminalExpanded(false);
                }}
                title={isTerminalMinimized ? "Restore" : "Minimize"}
              >
                {isTerminalMinimized ? <Maximize2 size={12} className="text-zinc-500" /> : <X size={12} className="text-zinc-500" />}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {!isTerminalMinimized && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className={cn(
                  "p-3 overflow-y-auto font-mono leading-relaxed custom-scrollbar bg-black/20",
                  isTerminalExpanded ? "h-[50vh] text-[11px]" : "h-32 text-[9px]"
                )}>
                  {logs.length > 0 ? (
                    logs.slice(isTerminalExpanded ? -100 : -20).map((log, i) => {
                      const isError = log.includes('[ERROR]');
                      const cleanLog = log.replace(/^\[.*?\] /, '');
                      const trimmed = cleanLog.trim();
                      
                      let content: React.ReactNode = cleanLog;
                      
                      if (isTerminalExpanded) {
                        if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.includes('"')) {
                          try {
                            const parsed = JSON.parse(trimmed);
                            content = (
                              <div className="mt-2 mb-1 w-full overflow-hidden rounded-md border border-white/10 shadow-lg">
                                <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '12px', fontSize: '11px', background: 'rgba(0,0,0,0.4)' }}>
                                  {JSON.stringify(parsed, null, 2)}
                                </SyntaxHighlighter>
                              </div>
                            );
                          } catch (e) {}
                        } else if (trimmed.includes('\n    at ') || trimmed.includes('\n  at ') || (isError && trimmed.includes('\n'))) {
                          content = (
                            <div className="mt-2 mb-1 w-full overflow-hidden rounded-md border border-rose-500/20 shadow-lg">
                              <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '12px', fontSize: '11px', background: 'rgba(30,0,0,0.3)' }}>
                                {trimmed}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                      }

                      return (
                        <div key={i} className={cn("flex gap-2 mb-1", typeof content !== 'string' && "items-start")}>
                          <span className="text-zinc-700 shrink-0 mt-0.5">{logs.length - logs.slice(isTerminalExpanded ? -100 : -20).length + i + 1}</span>
                          <div className={cn(
                            "break-all flex-1 min-w-0",
                            isError ? 'text-rose-400' : 
                            log.includes('[REASON]') ? 'text-rose-300' : 
                            log.includes('[FIX]') ? 'text-amber-400 font-bold' : 
                            log.includes('[SYSTEM]') ? 'text-blue-400' : 
                            log.includes('[SUCCESS]') ? 'text-emerald-400' : 
                            log.includes('[CONTROLS]') ? 'text-amber-400' :
                            'text-zinc-500'
                          )}>
                            {content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-700 italic">Console ready. Waiting for input...</div>
                  )}
                  {isDeploying && (
                    <div className="flex gap-2 animate-pulse text-emerald-500 mt-1">
                      <span className="shrink-0 text-zinc-700">{logs.length + 1}</span>
                      <span>Writing code modules...</span>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
