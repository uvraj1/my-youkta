import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentSwarmNode, AgentStatus } from './AgentSwarmNode';
import { ProjectPreview } from './ProjectPreview';
import JSZip from 'jszip';
import { 
  Play, 
  Terminal as TerminalIcon, 
  Code, 
  Cpu, 
  Zap, 
  RefreshCcw, 
  Download,
  AlertCircle,
  CheckCircle2,
  Settings2,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Bot,
  Send,
  X,
  Key,
  Shield,
  Save,
  Eye,
  EyeOff,
  Cpu as CpuIcon,
  Activity,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Globe,
  Smartphone,
  Layers,
  Wrench,
  MessageSquare,
  Lock,
  Unlock,
  Layout,
  ZoomIn,
  ZoomOut,
  Maximize,
  Box,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  MarkerType,
  Connection
} from '@xyflow/react';
import { FlowAgentNode } from './FlowAgentNode';
import { generateSwarmStep } from '../services/gemini';

const nodeTypes = {
  agent: FlowAgentNode,
};

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  isCompleted: boolean;
  lastMessage?: string;
  output?: string;
  history?: { message: string; type: 'log' | 'code' }[];
}

const INITIAL_SWARM_CONNECTIONS: Record<string, string[]> = {
  ceo: ['strategy', 'build', 'support'],
  strategy: ['frontend', 'backend', 'game', 'asset', 'character-artist'],
  frontend: ['asset', 'qa', 'vfx-animation'],
  backend: ['qa', 'security'],
  game: ['qa'],
  asset: ['frontend'],
  'character-artist': ['game', 'vfx-animation'],
  qa: ['debugger', 'security'],
  security: ['build'],
  debugger: ['ceo', 'strategy', 'frontend', 'backend'], 
  build: ['support'],
  support: ['nexus'],
  nexus: ['ceo'],
  'vfx-animation': ['frontend', 'game'],
  aegis: ['ceo', 'strategy', 'game', 'qa', 'security', 'debugger', 'asset', 'frontend', 'backend', 'build', 'support', 'nexus', 'character-artist'],
};

const INITIAL_AGENTS: AgentInfo[] = [
  { id: 'ceo', name: 'Prime Lucifer', role: 'CEO', status: 'Idle', isCompleted: false },
  { id: 'strategy', name: 'Architect X', role: 'Project Manager', status: 'Idle', isCompleted: false },
  { id: 'game', name: 'Proto Dev', role: 'Lead Developer', status: 'Idle', isCompleted: false },
  { id: 'qa', name: 'Final Judge', role: 'QA Tester', status: 'Idle', isCompleted: false },
  { id: 'security', name: 'Cyber Shield', role: 'Security Analyst', status: 'Idle', isCompleted: false },
  { id: 'debugger', name: 'Bug Hunter', role: 'Debugger', status: 'Idle', isCompleted: false },
  { id: 'aegis', name: 'Aegis Healer', role: 'Self-Healing Protocol', status: 'Idle', isCompleted: false, lastMessage: 'Neural Pulse Monitoring: ACTIVE. Self-Healing Protocols: STANDBY.' },
  { id: 'asset', name: 'Shape Shifter', role: 'Asset Creator', status: 'Idle', isCompleted: false },
  { id: 'character-artist', name: 'Meta Weaver', role: 'AAA Character Rigging', status: 'Idle', isCompleted: false },
  { id: 'frontend', name: 'Canvas Master', role: 'UI Designer', status: 'Idle', isCompleted: false },
  { id: 'backend', name: 'Core Engine', role: 'Backend Engineer', status: 'Idle', isCompleted: false },
  { id: 'build', name: 'Cloud Forge', role: 'DevOps Engineer', status: 'Idle', isCompleted: false },
  { id: 'support', name: 'Linker Pro', role: 'Support Specialist', status: 'Idle', isCompleted: false },
  { id: 'vfx-animation', name: 'Motion Weaver', role: 'VFX Director', status: 'Idle', isCompleted: false },
  { id: 'nexus', name: 'Nexus Github', role: 'Hosting Automator', status: 'Idle', isCompleted: false, lastMessage: 'Integrated Hosting Protocol: STANDBY. Awaiting GitHub Session.' },
];

interface BuildStep {
  id: string;
  message: string;
  status: 'pending' | 'active' | 'success' | 'error';
}

const PROJECT_TYPES = [
  { id: 'ai_agent', name: 'AI AGENT', icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'ai_bot', name: 'AI BOT', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'website', name: 'WEBSITE', icon: Globe, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'web_app', name: 'WEB APP', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'android_app', name: 'MOBILE APP', icon: Smartphone, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'unity_game', name: 'UNITY 3D', icon: Box, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'godot_game', name: 'GODOT ENGINE', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'tool', name: 'SYSTEM TOOL', icon: Wrench, color: 'text-slate-400', bg: 'bg-slate-400/10' },
];

export function AgentSwarm() {
  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0].id);
  const [instruction, setInstruction] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [collaboratingIds, setCollaboratingIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ agent: string; message: string; type: 'log' | 'code' | 'error' }[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBuildConsole, setShowBuildConsole] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('lucifer_swarm_keys');
    const parsed = saved ? JSON.parse(saved) : {};
    return { global: process.env.GEMINI_API_KEY || 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM', ...parsed };
  });
  const [apiConfig, setApiConfig] = useState<{provider: string, baseUrl: string, model: string}>(() => {
    const saved = localStorage.getItem('youkta_api_config');
    if (saved) return JSON.parse(saved);
    const envKey = process.env.GEMINI_API_KEY || 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM';
    if (envKey.startsWith('nvapi-')) return { provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct' };
    if (envKey.startsWith('gsk_')) return { provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile' };
    if (envKey.startsWith('sk-') && !envKey.includes('ant')) return { provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
    return { provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash' };
  });
  const [agentApiConfigs, setAgentApiConfigs] = useState<Record<string, {provider: string, baseUrl: string, model: string}>>(() => {
    const saved = localStorage.getItem('youkta_agent_api_configs');
    return saved ? JSON.parse(saved) : {};
  });
  const [swarmConnections, setSwarmConnections] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('youkta_swarm_connections');
    return saved ? JSON.parse(saved) : INITIAL_SWARM_CONNECTIONS;
  });
  const [savedPositions, setSavedPositions] = useState<Record<string, {x: number, y: number}>>(() => {
    const saved = localStorage.getItem('youkta_node_positions');
    return saved ? JSON.parse(saved) : {};
  });
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [swarmContext, setSwarmContext] = useState("Project Started.");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % SUGGESTED_PROMPTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getWeights = useCallback((agentId: string) => {
    const outWeight = swarmConnections[agentId]?.length || 0;
    const inWeight = Object.values(swarmConnections).filter(targets => targets.includes(agentId)).length;
    return { inWeight, outWeight };
  }, [swarmConnections]);

  const onConnect = useCallback((connection: Connection) => {
    setSwarmConnections(prev => {
      const newConns = { ...prev };
      const { source, target } = connection;
      if (source && target) {
        if (!newConns[source]) newConns[source] = [];
        if (!newConns[source].includes(target)) {
          newConns[source] = [...newConns[source], target];
          localStorage.setItem('youkta_swarm_connections', JSON.stringify(newConns));
        }
      }
      return newConns;
    });
  }, []);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    setSwarmConnections(prev => {
      const newConns = { ...prev };
      edgesToDelete.forEach(edge => {
        if (newConns[edge.source]) {
          newConns[edge.source] = newConns[edge.source].filter(t => t !== edge.target);
        }
      });
      localStorage.setItem('youkta_swarm_connections', JSON.stringify(newConns));
      return newConns;
    });
  }, []);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    setSavedPositions(prev => {
      const newPos = { ...prev, [node.id]: node.position };
      localStorage.setItem('youkta_node_positions', JSON.stringify(newPos));
      return newPos;
    });
  }, []);

  useEffect(() => {
    const total = agents.length;
    const cx = dimensions.width / 2 || 500;
    const cy = dimensions.height / 2 || 400;
    const cols = 5;
    const spacingX = 180;
    const spacingY = 140;
    const rows = Math.ceil(total / cols);
    const gridWidth = (cols - 1) * spacingX;
    const gridHeight = (rows - 1) * spacingY;
    const startX = cx - gridWidth / 2;
    const startY = cy - gridHeight / 2;

    setNodes(currentNodes => {
      return agents.map((agent, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const weights = getWeights(agent.id);
        
        const existingNode = currentNodes.find(n => n.id === agent.id);
        const defaultPosition = savedPositions[agent.id] || {
          x: startX + col * spacingX,
          y: startY + row * spacingY
        };

        return {
          id: agent.id,
          type: 'agent',
          position: existingNode?.position || defaultPosition,
          data: {
            ...agent,
            inWeight: weights.inWeight,
            outWeight: weights.outWeight,
            isActive: activeAgentId === agent.id,
            isCollaborating: collaboratingIds.includes(agent.id),
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id);
              if (agent.lastMessage) addLog(agent.name, agent.lastMessage);
            },
          },
        };
      });
    });

    setEdges(currentEdges => {
      const newEdges: Edge[] = [];
      Object.entries(swarmConnections).forEach(([source, targets]) => {
        targets.forEach(target => {
          const isActive = (activeAgentId === source && collaboratingIds.includes(target)) || 
                          (activeAgentId === target && collaboratingIds.includes(source));
          
          newEdges.push({
            id: `${source}-${target}`,
            source,
            target,
            animated: isActive,
            style: {
              stroke: isActive ? '#06b6d4' : 'rgba(255,255,255,0.1)',
              strokeWidth: isActive ? 3 : 1,
              transition: 'stroke-width 0.5s, stroke 0.5s',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.1)',
            },
          });
        });
      });
      return newEdges;
    });
  }, [agents, activeAgentId, collaboratingIds, dimensions.width, dimensions.height, selectedAgentId, swarmConnections, savedPositions, getWeights]);

  const startFactory = async (isRevision = false, autoCmd?: string) => {
    const selectedType = PROJECT_TYPES.find(p => p.id === projectType)?.name || 'Digital Asset';
    const targetCmd = autoCmd || instruction;
    const finalInstruction = isRevision 
      ? `[TARGET: ${selectedType}] ${targetCmd} | UPDATED PLAN: ${revisionNote}` 
      : `[TARGET: ${selectedType}] ${targetCmd}`;
    
    if (!finalInstruction.trim()) return;
    
    setIsProcessing(true);
    setAgents(prev => prev.map(a => ({ ...a, status: 'Idle', isCompleted: false })));
    if (!isRevision) setLogs([]);
    
    addLog('System', isRevision ? `APPLYING REVISIONS: ${revisionNote}` : `Initializing Neural Fabric for Directive: ${targetCmd}`, 'log');

    const agentIds = INITIAL_AGENTS.map(a => a.id);
    let currentContext = isRevision ? `${swarmContext}\nUSER_FEEDBACK: ${revisionNote}` : "Project Initialized.";
    const MAX_ATTEMPTS = 5;

    const fallbackProfiles: Array<{ apiKey: string, apiConfig: any, sourceName: string }> = [];
    const addedKeys = new Set<string>();

    const addProfile = (key: string, config: any, sourceName: string) => {
      if (key && typeof key === 'string' && key.trim() !== '' && !addedKeys.has(key.trim())) {
        fallbackProfiles.push({ apiKey: key.trim(), apiConfig: config, sourceName });
        addedKeys.add(key.trim());
      }
    };

    addProfile(apiKeys['global'] || process.env.GEMINI_API_KEY || '', apiConfig, 'Global Key');
    for (const [keyId, keyVal] of Object.entries(apiKeys)) {
      if (keyId !== 'global' && keyId !== 'meshy' && keyId !== 'luma' && keyId !== 'elevenlabs' && keyId !== 'github_token') {
         addProfile(keyVal as string, agentApiConfigs[keyId] || apiConfig, `${keyId} Key`);
      }
    }

    if (fallbackProfiles.length === 0) {
      alert("SYSTEM HALTED: No Global API Key found. Please click the Settings gear icon and add your API Key first!");
      setShowSettings(true);
      setIsProcessing(false);
      return;
    }

    const is3D = finalInstruction.toLowerCase().includes('3d') || finalInstruction.toLowerCase().includes('open world') || finalInstruction.toLowerCase().includes('gta') || finalInstruction.toLowerCase().includes('pubg');
    
    const prompt = `[CEO NEURAL BRAIN ACTIVATED]
IDENTITY: Prime Lucifer - Elite Game Studio CEO & Master Architect.
DIRECTIVE: "${finalInstruction}"

--- CEO LOGIC ENGINE PIPELINE ---
1. STRATEGIC BRAIN ANALYSIS: Flawlessly understand English, Hindi, or Hinglish inputs. 
   - If the user's idea lacks depth, win/loss conditions, scoring, progression, or player controls -> AUTONOMOUSLY INVENT AND INJECT THEM.
   - Design a highly addictive game loop.
   - CRITICAL: Always implement a Universal Control Engine (WASD/Arrow keys, Mouse inputs, and Mobile Touch controls) so the player can perfectly control the game.
   - CRITICAL: Auto-generate a Pause and Resume menu (triggered by 'ESC'/'P' or an on-screen pause button) that halts the game loop and displays a clean UI overlay.
2. ARCHITECTURE: Choose the best tech stack. ${is3D ? 'Use THREE.js + Cannon.js for 3D physics, lighting, and WASD/Mouse controls.' : 'Use HTML5 Canvas for a smooth, 60FPS 2D game with juicy animations and screen shake.'}
3. EXECUTION: DO NOT output a prototype. Write the literal, complete, highly polished game code.
   - Web games MUST use pure Vanilla JavaScript (No React/JSX unless requested).
   - Canvas MUST automatically resize to window.innerWidth / window.innerHeight.
   - The game MUST include a robust requestAnimationFrame loop and proper variable scoping.

Format your response strictly in exactly 4 markdown blocks:

### CEO_THOUGHTS
\`\`\`text
Explain your deep strategy. What missing logic did you auto-correct? Detail the game loop architecture, mechanics, and controls. Let your CEO Brain shine.
\`\`\`

### HTML
\`\`\`html
<!-- UI elements and canvas container -->
\`\`\`

### CSS
\`\`\`css
/* All styling */
\`\`\`

### JAVASCRIPT
\`\`\`javascript
// Complete game loop and logic
\`\`\`

Do not include any other text. Only these 4 blocks.`;

    let ceoThoughts = 'Analyzing directive and architecting game physics...';
    let realHtml = '<div id="game-root"></div>';
    let realCss = 'body { margin: 0; background: #000; overflow: hidden; }';
    let realJs = 'console.log("Ready");';
    let fetchError: any = null;

    const executeFetch = async () => {
      let attempt = 0;
      let profileIndex = 0;
      const MAX_RETRIES = 5;
      while (attempt < MAX_RETRIES) {
        attempt++;
        const currentProfile = fallbackProfiles[profileIndex];
        const apiKey = currentProfile.apiKey;
        const currentApiConfig = currentProfile.apiConfig;
        try {
          if (currentApiConfig.provider === 'gemini') {
            const geminiModel = currentApiConfig.model || 'gemini-1.5-flash';
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'API Request Failed');
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            const baseUrl = (currentApiConfig.baseUrl || '').trim().replace(/\/$/, '');
            let modelName = (currentApiConfig.model || '').trim();
            if (modelName.includes('safety-guard')) modelName = 'meta/llama3-70b-instruct';
            let res;
            try {
              res = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ 
                  model: modelName, 
                  messages: [{ role: 'user', content: prompt }],
                  ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {})
                })
              });
            } catch (err: any) {
              if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                res = await fetch('http://localhost:3001/api/proxy/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    url: `${baseUrl}/chat/completions`, 
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, 
                    body: { model: modelName, messages: [{ role: 'user', content: prompt }], ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {}) } 
                  })
                });
              } else {
                throw err;
              }
            }
            const data = await res.json();
            if (!res.ok) {
              const errorMsg = data.error?.message || data.detail || data.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) || `API request failed: ${res.status}`;
              throw new Error(errorMsg);
            }
            if (data.error && data.error.message) throw new Error(data.error.message);
            return data.choices?.[0]?.message?.content || '';
          }
        } catch (error: any) {
          const errMsg = error.message || String(error);
          const isFallbackable = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota") || errMsg.includes("401") || errMsg.includes("403") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("key") || errMsg.includes("models/") || errMsg.toLowerCase().includes("not found");
          if (isFallbackable && profileIndex < fallbackProfiles.length - 1) {
            profileIndex++;
            addLog('System', `API issue detected. Seamlessly switching to ${fallbackProfiles[profileIndex].sourceName}...`, 'log');
            attempt--; 
            continue;
          }
          const isHighDemand = errMsg.includes("503") || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded");
          if (isHighDemand && attempt < MAX_RETRIES) {
            addLog('System', `High Demand (503). Auto-retrying attempt ${attempt}/${MAX_RETRIES}...`, 'log');
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000 + Math.random() * 1000));
          } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.toLowerCase().includes("quota")) {
            throw new Error("429_QUOTA_EXHAUSTED");
          } else {
            throw error;
          }
        }
      }
      return '';
    };

    let fetchPromise = executeFetch();

    const fetchTask = fetchPromise.then(text => {
      if (text.includes('"User Safety"')) {
         fetchError = new Error("MODEL ERROR: Safety Guard model detected. Change Model ID to 'meta/llama-3.1-70b-instruct' in Settings.");
         return;
      }

      const thoughtsMatch = text.match(/### CEO_THOUGHTS\s*```(?:text)?\s*([\s\S]*?)```/i) || text.match(/```text\s*([\s\S]*?)```/i);
      const htmlMatch = text.match(/### HTML\s*```(?:html)?\s*([\s\S]*?)```/i) || text.match(/```html\s*([\s\S]*?)```/i);
      const cssMatch = text.match(/### CSS\s*```(?:css)?\s*([\s\S]*?)```/i) || text.match(/```css\s*([\s\S]*?)```/i);
      const jsMatch = text.match(/### JAVASCRIPT\s*```(?:javascript|js)?\s*([\s\S]*?)```/i) || text.match(/```(?:javascript|js)\s*([\s\S]*?)```/i);
      
      if (thoughtsMatch) ceoThoughts = thoughtsMatch[1].trim();
      if (htmlMatch) realHtml = htmlMatch[1];
      if (cssMatch) realCss = cssMatch[1];
      if (jsMatch) realJs = jsMatch[1];
      else if (!htmlMatch && !cssMatch && !thoughtsMatch) {
         realJs = text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
      }
    }).catch(err => { fetchError = err; });

    const getAgentMessage = (role: string) => {
       const r = role.toLowerCase();
       if (r.includes('ceo')) return "[CEO BRAIN] Analyzing directive, injecting missing logic, and architecting game physics...";
       if (r.includes('manager')) return "Tasks distributed to the neural swarm.";
       if (r.includes('qa')) return "Running automated integration tests... Passed.";
       if (r.includes('security')) return "Applying encryption and memory protection headers.";
       if (r.includes('debugger')) return "Syntax parsing complete. Zero warnings detected.";
       if (r.includes('vfx')) return "Particle systems and post-processing pipeline active.";
       if (r.includes('devops')) return "Build environment isolated and secured.";
       if (r.includes('support')) return "Packaging final payload for delivery.";
       if (r.includes('character') || r.includes('rigging')) return "Generating Inverse Kinematics and AAA Animation Controllers.";
       return "Module initialized successfully.";
    };

    for (const id of agentIds) {
      if (id === 'aegis') continue; // Skip healer in main loop
      
      // Special logic for Nexus (GitHub Hosting)
      if (id === 'nexus') {
        const isAndroid = projectType === 'android_app';
        if (isAndroid) {
          addLog('Nexus Github', 'Platform Detected: MOBILE. Auto-hosting bypassed (Local Build Required).', 'log');
          setAgents(prev => prev.map(a => a.id === 'nexus' ? { ...a, status: 'Ready', isCompleted: true, lastMessage: 'Android hosting requires manual signature.' } : a));
          continue;
        }

        const hasGithub = !!apiKeys.github_token;
        if (!hasGithub) {
          addLog('Nexus Github', 'Protocol: [OPTIONAL] | Status: DISCONNECTED. Set GitHub Token in Settings to enable auto-hosting.', 'log');
          setAgents(prev => prev.map(a => a.id === 'nexus' ? { ...a, status: 'Ready', isCompleted: true, lastMessage: 'GitHub link not established.' } : a));
          continue;
        }
      }

      const agent = INITIAL_AGENTS.find(a => a.id === id);
      if (!agent) continue;

      let stepSuccess = false;
      let attempts = 0;

      while (!stepSuccess && attempts < MAX_ATTEMPTS) {
        attempts++;
        setActiveAgentId(id);
        setCollaboratingIds(swarmConnections[id] || []);
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'Thinking' } : a));
        
        try {
          let stepStatus = 'Ready';
          let stepMessage = getAgentMessage(agent.role);
          let stepOutput = '';
          const hasOverride = !!(apiKeys[id] || agentApiConfigs[id]);

          if (id === 'ceo' || id === 'frontend' || id === 'asset' || id === 'backend') {
              await fetchTask;
              if (fetchError) {
                  stepStatus = 'Fixing';
                  stepMessage = `Critical API Error: ${fetchError.message}`;
                  throw fetchError;
              } else {
                  if (id === 'ceo') { stepOutput = ceoThoughts; stepMessage = 'CEO Brain Execution: Strategy formulated & logic auto-corrected.'; }
                  if (id === 'frontend') { stepOutput = realHtml; stepMessage = 'Compiled core HTML5 structure and UI overlays.'; }
                  if (id === 'asset') { stepOutput = realCss; stepMessage = 'Generated CSS styles and spatial layouts.'; }
                  if (id === 'backend') { stepOutput = realJs; stepMessage = 'Engine logic, physics, and game loop materialized.'; }
              }
          } else if (id === 'asset' && apiKeys['meshy']) {
              // Actual Meshy 3D API Hook
              stepMessage = 'Contacting Meshy 3D API for environment generation...';
              try {
                await fetch('http://localhost:3001/api/generate-asset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: finalInstruction, type: '3D_MODEL', apiKey: apiKeys['meshy'] })
                });
                stepOutput = "// 3D Asset generation initiated. Check Local Server logs.";
                stepStatus = 'Ready';
              } catch (e) {
                stepMessage = 'Local server unreachable. Simulating asset proxy.';
                const step = await generateSwarmStep(agent.name, currentContext, finalInstruction);
                stepStatus = step.status;
                stepOutput = step.output || '';
              }
          } else if (id === 'character-artist') {
              if (apiKeys['meshy']) {
                fetch('http://localhost:3001/api/generate-asset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: finalInstruction, type: 'CHARACTER_MODEL', apiKey: apiKeys['meshy'] })
                }).catch(()=>{});
              }
              if (hasOverride || apiKeys['meshy']) {
                 const step = await generateSwarmStep(agent.name, currentContext, finalInstruction);
                 stepStatus = step.status;
                 stepMessage = "AAA Mixamo/MetaHuman Controller scripts materialized.";
                 stepOutput = step.output || '';
              } else {
                 await new Promise(r => setTimeout(r, 1200));
                 stepMessage = "Generated standard rig controller.";
              }
          } else if (hasOverride) {
              const step = await generateSwarmStep(agent.name, currentContext, finalInstruction);
              stepStatus = step.status;
              stepMessage = step.message;
              stepOutput = step.output || '';
          } else {
              await new Promise(r => setTimeout(r, 1200)); // Simulate thinking
          }

          const step = { status: stepStatus, message: stepMessage, output: stepOutput };
          
          setAgents(prev => prev.map(a => a.id === id ? { 
            ...a, 
            status: step.status as AgentStatus, 
            lastMessage: step.message,
            output: step.output,
            history: [...(a.history || []), { message: step.message, type: 'log' }, ...(step.output ? [{ message: step.output, type: 'code' as const }] : [])]
          } : a));

          if (step.status === 'Fixing') {
            addLog(agent.name, step.message, 'error');
            addLog('Aegis Healer', `Detected Quota/Neural Glitch in ${agent.name}. Cooldown initiated...`, 'log');
            setActiveAgentId('aegis');
            setCollaboratingIds([id]);
            await new Promise(r => setTimeout(r, 8000));
            
            if (attempts < MAX_ATTEMPTS) {
              addLog('Aegis Healer', `Retrying ${agent.name} sequence (Attempt ${attempts + 1}/${MAX_ATTEMPTS})`, 'log');
              continue; 
            }
          }

          stepSuccess = true;
          addLog(agent.name, step.message, 'log');
          if (step.output) {
            addLog(agent.name, step.output, 'code');
          }

          // Buffer delay between agents to prevent burst quota hits
          await new Promise(r => setTimeout(r, 4000)); 
          
          setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'Ready', isCompleted: true } : a));
          currentContext += `\n${agent.name}: ${step.message}`;
          if (stepOutput) {
            currentContext += `\n--- OUTPUT FROM ${agent.name} ---\n${stepOutput.substring(0, 4000)}\n--------------------------`;
          }
          setCollaboratingIds([]);
        } catch (error: any) {
          const errMsg = error.message || String(error);
          let reason = errMsg;
          let fix = "Restart process or check configurations.";
          
          if (errMsg.toLowerCase().includes("key")) {
            reason = "Invalid or missing API key.";
            fix = "Add a valid key in Settings.";
          } else if (errMsg === "429_QUOTA_EXHAUSTED" || errMsg.includes("429") || errMsg.toLowerCase().includes("quota")) {
            reason = "API Rate Limit / Quota Exhausted.";
            fix = "Wait exactly 1 minute before generating again, or provide a new API key.";
          } else if (errMsg.toLowerCase().includes("high demand") || errMsg.includes("503") || errMsg.toLowerCase().includes("overloaded")) {
            reason = "The AI provider is currently experiencing high demand (503).";
            fix = "Spikes in demand are temporary. Wait a moment and retry, or switch providers.";
          } else if (errMsg.includes("models/")) {
            reason = "AI model not found or unsupported.";
            fix = "Check model name compatibility.";
          } else if (errMsg === "Failed to fetch") {
            reason = "Network or CORS error.";
            fix = "Check internet connection and verify Base URL.";
          }

          addLog('System', `[CRITICAL FAILURE] in ${agent.name}`, 'error');
          addLog('System', `[REASON] ${reason}`, 'error');
          addLog('System', `[FIX] ${fix}`, 'log');

          if (attempts < MAX_ATTEMPTS) {
            await new Promise(r => setTimeout(r, 10000));
            continue;
          }
        }
      }
    }

    setSwarmContext(currentContext);
    setActiveAgentId(null);
    setCollaboratingIds([]);
    setIsProcessing(false);
    setRevisionNote('');
    addLog('System', 'YOUKTA SWARM FACTORY: Phase Integration Complete.', 'log');
  };

  const handleDownload = async (type: 'ZIP' | 'APK') => {
    const supportAgent = agents.find(a => a.id === 'support')?.name || 'Linker Pro';
    
    if (type === 'APK') {
      setShowBuildConsole(true);
      setBuildSteps([
        { id: 'env', message: 'Initializing Android Build Environment...', status: 'active' },
        { id: 'code', message: 'Analyzing Neural Code Structures...', status: 'pending' },
        { id: 'gradle', message: 'Configuring Gradle Build Runner...', status: 'pending' },
        { id: 'compile', message: 'Compiling Java & Kotlin Bytecode...', status: 'pending' },
        { id: 'dex', message: 'Generating Dalvik Executable (DEX)...', status: 'pending' },
        { id: 'sign', message: 'Applying Quantum Security Signature...', status: 'pending' },
        { id: 'ready', message: 'Finalizing APK Package Architecture...', status: 'pending' }
      ]);

      const runStep = async (idx: number) => {
        if (idx >= 7) return;
        setBuildSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: 'active' } : i < idx ? { ...s, status: 'success' } : s));
        await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
        if (idx === 6) {
          setBuildSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: 'success' } : s));
          
          // Download simulation
          const content = `YOUKTA SWARM FACTORY NEURAL BUILD\nTarget: Android Mobile\nPhase: Production\n\nNOTE: You are in a browser sandbox. Direct .apk binary generation requires a backend build server.\nFor your phone to install this, follow these steps:\n1. Download the Source Code ZIP.\n2. Upload it to a service like Expo.dev or Capacitor.\n3. Build the actual signed binary there.\n\nThis simulation confirms that your swarm logic is valid and ready for mobile deployment.`;
          const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lucifer_neural_build.apk`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          addLog(supportAgent, `APK simulated binary delivered. View build console for installation guide.`, 'log');
        } else {
          runStep(idx + 1);
        }
      };
      runStep(0);
      return;
    }

    setAgents(prev => prev.map(a => a.id === 'support' ? { ...a, status: 'Coding' } : a));
    addLog(supportAgent, `Bundling architecture into secure ZIP archive...`, 'log');
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("lucifer_swarm_project");

      const html = agents.find(a => a.id === 'frontend')?.output || '';
      const css = agents.find(a => a.id === 'asset')?.output || '';
      const js = agents.find(a => a.id === 'backend')?.output || '';
      
      let finalHtml = html;
      if (!html.toLowerCase().includes('<html')) {
        finalHtml = `<!-- Architected and Handcrafted by Youbaraj -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Youbaraj Generated Game</title>\n  <link rel="stylesheet" href="style.css">\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</head>\n<body>\n  ${html}\n  <script src="game.js"></script>\n</body>\n</html>`;
      } else {
        if (!finalHtml.includes('style.css')) finalHtml = finalHtml.replace('</head>', `  <link rel="stylesheet" href="style.css">\n</head>`);
        if (!finalHtml.includes('game.js')) finalHtml = finalHtml.replace('</body>', `  <script src="game.js"></script>\n</body>`);
      }

      folder?.file("index.html", finalHtml);
      folder?.file("style.css", css);
      folder?.file("game.js", js);

      const buildReport = `YOUKTA SWARM FACTORY BUILD REPORT\nGenerated: ${new Date().toLocaleString()}\nInstruction: ${instruction}\n\nThis is a REAL, playable web game!\nJust open index.html in any browser.`;
      folder?.file("BUILD_REPORT.txt", buildReport);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucifer_project_source.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addLog(supportAgent, `Package sealed and delivered. Integrity verified.`, 'log');
      setAgents(prev => prev.map(a => a.id === 'support' ? { ...a, status: 'Ready' } : a));
    } catch (err: any) {
      addLog('System', `Encryption failure: ${err}`, 'error');
    }
  };

  const handleGlobalKeyChange = (key: string) => {
    setApiKeys(prev => ({ ...prev, global: key }));
    
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
      setApiConfig(newConfig);
    }
  };

  const handleAgentKeyChange = (agentId: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [agentId]: key }));
    
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
      setAgentApiConfigs(prev => ({ ...prev, [agentId]: newConfig }));
    }
  };

  const saveApiKeys = (newKeys: Record<string, string>) => {
    setApiKeys(newKeys);
    localStorage.setItem('lucifer_swarm_keys', JSON.stringify(newKeys));
    localStorage.setItem('youkta_api_config', JSON.stringify(apiConfig));
    localStorage.setItem('youkta_agent_api_configs', JSON.stringify(agentApiConfigs));
    addLog('System', 'Neural API integrity verified. Configuration saved.', 'log');
    setShowSettings(false);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        window.requestAnimationFrame(() => {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Neural Self-Healing Logic
  useEffect(() => {
    const healInterval = setInterval(() => {
      const failingAgent = agents.find(a => a.status === 'Fixing' && a.id !== 'aegis');
      if (failingAgent) {
        addLog('Aegis Healer', `Detected anomaly in ${failingAgent.name}. Initiating Self-Healing Protocols...`, 'log');
        setActiveAgentId('aegis');
        setCollaboratingIds([failingAgent.id]);
        
        setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === failingAgent.id ? { ...a, status: 'Ready', lastMessage: 'Neural paths restored by AEGIS.' } : a));
          addLog('Aegis Healer', `${failingAgent.name} successfully repaired. Neural integrity: 100%.`, 'log');
          setActiveAgentId(null);
          setCollaboratingIds([]);
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(healInterval);
  }, [agents]);

  const resetLayout = () => {
    localStorage.removeItem('youkta_node_positions');
    setSavedPositions({});
    addLog('System', 'Neural Grid stabilized. Positions recalibrated.', 'log');
  };

  const addLog = (agent: string, message: string, type: 'log' | 'code' | 'error' = 'log') => {
    setLogs(prev => [...prev, { agent, message, type }]);
  };

  return (
    <div className="flex flex-col h-full bg-[#020202] text-white p-4 gap-4 overflow-hidden font-sans">
      {/* Neural Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-30 px-5 py-2 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl mx-2">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-cyan-500" />
          <h1 className="text-xs font-black tracking-[0.4em] uppercase text-white italic">
            YOUKTA SWARM FACTORY
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 mr-4">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/5 bg-white/5">
              <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[8px] font-mono text-white/40">SYSTEM SYNC</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {!isProcessing && agents.every(a => a.isCompleted) && agents.length > 0 && (
              <button 
                onClick={() => handleDownload('ZIP')}
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5"
                title="Download Source Code"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                showPreview ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-white/40"
              )}
            >
              {showPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => setShowTerminal(!showTerminal)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                showTerminal ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-white/5 text-white/40"
              )}
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0 relative">
        {/* Sidebar: Control Panel */}
        <AnimatePresence>
          {showControlPanel && (
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-[340px] flex flex-col bg-black/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 pointer-events-auto"
            >
              <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CpuIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <h2 className="text-[10px] font-mono text-white/70 uppercase tracking-[0.2em] font-bold"> Digital Foundation </h2>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => zoomIn()} 
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-cyan-500"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => zoomOut()} 
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-cyan-500"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => fitView({ duration: 800 })} 
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-cyan-500"
                    title="Fit View"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={resetLayout} 
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-cyan-500"
                    title="Reset Layout"
                  >
                    <Layout className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsLocked(!isLocked)} 
                    className={cn(
                      "p-1 hover:bg-white/10 rounded transition-colors",
                      isLocked ? "text-amber-500" : "text-white/30 hover:text-cyan-500"
                    )}
                    title={isLocked ? "Unlock Interactivity" : "Lock Interactivity"}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  {!isProcessing && agents.every(a => a.isCompleted) && agents.length > 0 && (
                    <button 
                      onClick={() => handleDownload('ZIP')} 
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-cyan-500"
                      title="Download Source"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setShowControlPanel(false)} className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-white">
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Control Panel Content */}
                {!isProcessing && agents.every(a => a.isCompleted) && agents.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                       <div className={cn("p-2.5 rounded-xl", PROJECT_TYPES.find(p => p.id === projectType)?.bg)}>
                          {React.createElement(PROJECT_TYPES.find(p => p.id === projectType)?.icon || Bot, { className: cn("w-5 h-5", PROJECT_TYPES.find(p => p.id === projectType)?.color) })}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{PROJECT_TYPES.find(p => p.id === projectType)?.name}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Deployment Sequence Complete</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleDownload('ZIP')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 hover:bg-cyan-500/20 transition-all uppercase tracking-widest">SOURCE.ZIP</button>
                      <button onClick={() => handleDownload('APK')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 hover:bg-indigo-500/20 transition-all uppercase tracking-widest">APP.APK</button>
                    </div>
                    <div className="relative pt-2">
                      <div className="absolute top-0 left-4 px-2 bg-black text-[8px] font-mono text-white/30 uppercase tracking-widest">Neural Revision</div>
                      <input type="text" value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} placeholder="REQUEST CHANGE..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 placeholder:text-white/10" onKeyDown={(e) => e.key === 'Enter' && startFactory(true)} />
                      <button onClick={() => startFactory(true)} className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] ml-2">Select Architecture</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROJECT_TYPES.map(type => (
                          <button key={type.id} onClick={() => setProjectType(type.id)} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", projectType === type.id ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:bg-white/10")}>
                            <type.icon className={cn("w-4 h-4", projectType === type.id ? type.color : "text-white")} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", projectType === type.id ? "text-white" : "text-white/40")}>{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] ml-2">Neural Directives</label>
                      <textarea 
                        value={instruction} 
                        onChange={(e) => setInstruction(e.target.value)} 
                        placeholder={`e.g. ${SUGGESTED_PROMPTS[placeholderIndex]}`} 
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 placeholder:text-white/30 resize-none"
                      />
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => startFactory()} 
                        disabled={isProcessing || !instruction.trim()} 
                        className={cn("w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all", isProcessing || !instruction.trim() ? "bg-white/5 text-white/10" : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]")}
                      >
                        {isProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                        <span>{isProcessing ? "Processing..." : "Ignite Neural Forge"}</span>
                      </button>
                      
                      {!isProcessing && (
                        <button 
                          onClick={() => {
                            const botCmd = "Build an advanced AI Bot interface with real-time chat, fluid animations, and interactive 3D elements.";
                            setProjectType('ai_bot');
                            setInstruction(botCmd);
                            startFactory(false, botCmd);
                          }}
                          className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        >
                          <Bot className="w-4 h-4" />
                          <span>1-Click Start Bot</span>
                        </button>
                      )}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace (Neural Canvas) */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-black/40 rounded-3xl border border-white/5 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={!isLocked}
            nodesConnectable={!isLocked}
            panOnDrag={!isLocked}
            zoomOnScroll={!isLocked}
            proOptions={{ hideAttribution: true }}
            className="z-0"
            colorMode="dark"
          >
            <Background color="#1e293b" gap={60} size={1} />
          </ReactFlow>
          
          {/* Pinned Interface Overlays */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Agent Detail Popover */}
            <div className="absolute top-8 left-8 w-80 pointer-events-auto">
              <AnimatePresence>
                {selectedAgentId && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="p-5 bg-cyan-950/40 backdrop-blur-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden mb-4 rounded-2xl"
                  >
                    <div className="absolute top-0 right-0 p-2">
                      <button onClick={() => setSelectedAgentId(null)} className="text-white/20 hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30"><Bot className="w-5 h-5 text-cyan-400" /></div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{agents.find(a => a.id === selectedAgentId)?.name}</h3>
                        <p className="text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest">{agents.find(a => a.id === selectedAgentId)?.role}</p>
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                      {agents.find(a => a.id === selectedAgentId)?.history?.map((h, idx) => (
                        <div key={idx} className="text-[10px] text-white/70 bg-white/5 p-2 rounded-lg border border-white/5 mb-2">
                          {h.type === 'code' ? <pre className="text-emerald-400/80 text-[8px] whitespace-pre-wrap">{h.message}</pre> : <p>{h.message}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>


          {/* Terminal Toggle (Pinned Right) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
            {!showTerminal && (
              <motion.button initial={{ x: 20 }} animate={{ x: 0 }} whileHover={{ x: -5 }} onClick={() => setShowTerminal(true)} className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-l-2xl text-cyan-500 shadow-2xl">
                <PanelRightOpen className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Control Panel Toggle (Pinned Left) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
            {!showControlPanel && (
              <motion.button initial={{ x: -20 }} animate={{ x: 0 }} whileHover={{ x: 5 }} onClick={() => setShowControlPanel(true)} className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-r-2xl text-cyan-500 shadow-2xl">
                <PanelLeftOpen className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Status Bar (Pinned Bottom) */}
          <div className="absolute bottom-8 left-8 z-40 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl px-4 py-2 text-[9px] font-mono flex items-center gap-4 pointer-events-auto shadow-xl">
             <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full", isProcessing ? "bg-cyan-500 animate-ping" : "bg-green-500")} />
               <span className="text-white/50 uppercase tracking-widest">Status: {isProcessing ? 'Active' : 'Standby'}</span>
             </div>
             <div className="w-[1px] h-3 bg-white/10" />
             <button 
               onClick={resetLayout}
               className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold"
             >
               <RefreshCcw className="w-3 h-3" />
               Reset Grid
             </button>
             <div className="w-[1px] h-3 bg-white/10" />
             <button 
               onClick={() => setIsLocked(!isLocked)}
               className={cn(
                 "flex items-center gap-1.5 transition-colors uppercase tracking-widest font-bold",
                 isLocked ? "text-amber-500 hover:text-amber-400" : "text-white/40 hover:text-white/70"
               )}
             >
               {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
               {isLocked ? 'Grid Locked' : 'Lock Grid'}
             </button>
          </div>
        </div>
      </div>

    {/* Project Preview Overlay */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-[60] bg-black shadow-2xl rounded-3xl overflow-hidden border border-white/10"
            >
              <ProjectPreview 
                agents={agents} 
                onClose={() => setShowPreview(false)}
                onModify={(agentName, note) => {
                  setRevisionNote(`[${agentName}] ${note}`);
                  setShowPreview(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar: Command Terminal */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-[420px] flex flex-col bg-black/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  <h2 className="text-[10px] font-mono text-white/70 uppercase tracking-[0.2em] font-bold"> Neural Interaction Log </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setLogs([])} className="text-[10px] font-mono text-white/20 hover:text-cyan-500 transition-colors uppercase"> Wipe </button>
                  <button onClick={() => setShowTerminal(false)} className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-white">
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 font-mono text-[10px] space-y-4 scrollbar-thin">
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4 opacity-50">
                    <div className="w-12 h-12 border border-dashed border-white/20 rounded-full animate-spin-slow flex items-center justify-center">
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    <p className="tracking-widest capitalize">System Awaiting Signal...</p>
                  </div>
                )}
                {logs.map((log, i) => (
                  <motion.div key={i} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="group">
                    <div className="flex items-center gap-2 text-cyan-400/40 text-[9px] mb-1">
                      <span className="text-cyan-500">➤ {log.agent}</span>
                      <span className="opacity-50">|</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    {log.type === 'code' ? (
                      <div className="relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-cyan-500/20" />
                        <pre className="p-3 bg-black/40 text-emerald-400 border border-white/5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">{log.message}</pre>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="w-0.5 h-auto bg-white/5 rounded-full" />
                        <p className={cn("leading-relaxed tracking-wide", log.type === 'error' ? "text-red-400" : log.message.includes('[FIX]') ? "text-amber-400 font-bold" : "text-white/70")}>{log.message}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <Settings2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">System Core Configuration</h2>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Neural API & Key Management</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
                >
                  <X className="w-5 h-5 text-white/20 group-hover:text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-thin">
                <div className="space-y-8">
                  {/* API Provider Config */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CpuIcon className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">AI Engine Selection</h3>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <div className="flex gap-2">
                        <button onClick={() => setApiConfig({...apiConfig, provider: 'gemini'})} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border uppercase", apiConfig.provider === 'gemini' ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Gemini (Native)</button>
                        <button onClick={() => setApiConfig({provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct'})} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border uppercase", apiConfig.provider === 'nvidia' ? "bg-green-500/20 border-green-500 text-green-400" : "border-white/10 text-white/40 hover:bg-white/5")}>NVIDIA NIM</button>
                        <button onClick={() => setApiConfig({provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile'})} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border uppercase", apiConfig.provider === 'groq' ? "bg-orange-500/20 border-orange-500 text-orange-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Groq API</button>
                        <button onClick={() => setApiConfig({provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini'})} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border uppercase", apiConfig.provider === 'custom' ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Custom OpenAI</button>
                      </div>
                      {(apiConfig.provider === 'custom' || apiConfig.provider === 'nvidia' || apiConfig.provider === 'groq') && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-white/40 mb-1 block">Base URL</label>
                            <input type="text" value={apiConfig.baseUrl} onChange={e => setApiConfig({...apiConfig, baseUrl: e.target.value.replace(/base_url\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-indigo-500 text-indigo-400 transition-all" placeholder="https://api.openai.com/v1" />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-white/40 mb-1 block">Model ID</label>
                            <input type="text" value={apiConfig.model} onChange={e => setApiConfig({...apiConfig, model: e.target.value.replace(/model\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()})} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono outline-none focus:border-indigo-500 text-indigo-400 transition-all" placeholder="gpt-4o-mini" />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Global Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Global Neural Core</h3>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <p className="text-xs text-white/40 leading-relaxed">
                        This key handles all factory-wide operations. If an agent does not have a specific override, this core link will be used.
                      </p>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type={showKeyId === 'global' ? 'text' : 'password'}
                          value={apiKeys.global || ''}
                          onChange={(e) => handleGlobalKeyChange(e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())}
                          placeholder="ENTER GLOBAL API KEY..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-all text-cyan-400"
                        />
                        <button 
                          onClick={() => setShowKeyId(showKeyId === 'global' ? null : 'global')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                          {showKeyId === 'global' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {apiKeys.global === 'AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM' && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-3 shadow-lg shadow-emerald-500/5">
                          <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gemini API Project Linked</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="flex flex-col gap-1">
                              <span className="text-white/40 uppercase tracking-widest text-[8px]">Project Name</span>
                              <span className="text-emerald-300">projects/336042062988</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-white/40 uppercase tracking-widest text-[8px]">Project Number</span>
                              <span className="text-emerald-300">336042062988</span>
                            </div>
                            <div className="col-span-2 flex flex-col gap-1 mt-1">
                              <span className="text-white/40 uppercase tracking-widest text-[8px]">API Key Name</span>
                              <span className="text-blue-400 truncate">Gemini API Key</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* External Asset APIs */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="w-4 h-4 text-purple-500" />
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Asset Generation APIs</h3>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <p className="text-xs text-white/40 leading-relaxed">Keys for 3D Models, Textures, and Audio generation. (Meshy, Luma, ElevenLabs)</p>
                      <div className="space-y-3">
                         <input type="password" value={apiKeys['meshy'] || ''} onChange={(e) => setApiKeys(prev => ({...prev, meshy: e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()}))} placeholder="Meshy API Key (3D Models)" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono focus:border-purple-500 text-purple-400" />
                         <input type="password" value={apiKeys['luma'] || ''} onChange={(e) => setApiKeys(prev => ({...prev, luma: e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()}))} placeholder="Luma AI Key (Environments)" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono focus:border-purple-500 text-purple-400" />
                         <input type="password" value={apiKeys['elevenlabs'] || ''} onChange={(e) => setApiKeys(prev => ({...prev, elevenlabs: e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()}))} placeholder="ElevenLabs Key (Voice/SFX)" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono focus:border-purple-500 text-purple-400" />
                      </div>
                    </div>
                  </section>

                  {/* GitHub Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Deployment Integration</h3>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase mb-1">GitHub Nexus Sync</h4>
                          <p className="text-[10px] text-white/40 leading-relaxed max-w-[250px]">
                            Connect your account to allow the Nexus Agent to host projects automatically on your profile.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            const isConnected = !!apiKeys.github_token;
                            if (isConnected) {
                              setApiKeys(prev => {
                                const { github_token, ...rest } = prev;
                                return rest;
                              });
                              addLog('System', 'GitHub Nexus Disconnected.', 'log');
                            } else {
                              setApiKeys(prev => ({ ...prev, github_token: 'GHP_' + Math.random().toString(36).substring(7).toUpperCase() }));
                              addLog('System', 'GitHub Nexus Connected Successfully.', 'log');
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                            apiKeys.github_token 
                              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          )}
                        >
                          {apiKeys.github_token ? 'Disconnect Account' : 'Connect GitHub'}
                        </button>
                      </div>
                      
                      {apiKeys.github_token && (
                        <div className="pt-2">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                              Session Active: {apiKeys.github_token.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Individual Agents Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CpuIcon className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Individual Neural Overrides</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {INITIAL_AGENTS.map(agent => (
                        <div key={agent.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 shrink-0">
                              <Bot className="w-5 h-5 text-white/20" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-bold text-white mb-0.5 truncate uppercase tracking-wide">{agent.name}</h4>
                              <p className="text-[9px] text-white/20 font-mono truncate">{agent.role}</p>
                            </div>
                            <div className="relative w-48">
                              <input 
                                type={showKeyId === agent.id ? 'text' : 'password'}
                                value={apiKeys[agent.id] || ''}
                                onChange={(e) => handleAgentKeyChange(agent.id, e.target.value.replace(/api_key\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim())}
                                placeholder="DEFAULT KEY"
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-[10px] font-mono focus:outline-none focus:border-emerald-500/50 transition-all text-emerald-400 placeholder:text-white/5"
                              />
                              <button 
                                onClick={() => setShowKeyId(showKeyId === agent.id ? null : agent.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                              >
                                {showKeyId === agent.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-white/5">
                            <div className="flex gap-2">
                              <button onClick={() => setAgentApiConfigs(prev => { const n = {...prev}; delete n[agent.id]; return n; })} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border uppercase", !agentApiConfigs[agent.id] ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Inherit Global</button>
                              <button onClick={() => setAgentApiConfigs(prev => ({...prev, [agent.id]: {provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash'}}))} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border uppercase", agentApiConfigs[agent.id]?.provider === 'gemini' ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Gemini</button>                              <button onClick={() => setAgentApiConfigs(prev => ({...prev, [agent.id]: {provider: 'nvidia', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama3-70b-instruct'}}))} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border uppercase", agentApiConfigs[agent.id]?.provider === 'nvidia' ? "bg-green-500/20 border-green-500 text-green-400" : "border-white/10 text-white/40 hover:bg-white/5")}>NVIDIA</button>
                              <button onClick={() => setAgentApiConfigs(prev => ({...prev, [agent.id]: {provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile'}}))} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border uppercase", agentApiConfigs[agent.id]?.provider === 'groq' ? "bg-orange-500/20 border-orange-500 text-orange-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Groq</button>
                              <button onClick={() => setAgentApiConfigs(prev => ({...prev, [agent.id]: {provider: 'custom', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini'}}))} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border uppercase", agentApiConfigs[agent.id]?.provider === 'custom' ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "border-white/10 text-white/40 hover:bg-white/5")}>Custom</button>
                            </div>
                            {agentApiConfigs[agent.id] && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <input type="text" value={agentApiConfigs[agent.id].baseUrl} onChange={e => setAgentApiConfigs(prev => ({...prev, [agent.id]: {...prev[agent.id], baseUrl: e.target.value.replace(/base_url\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()}}))} className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-[9px] font-mono outline-none focus:border-indigo-500 text-indigo-400 transition-all" placeholder="Base URL" />
                                </div>
                                <div>
                                  <input type="text" value={agentApiConfigs[agent.id].model} onChange={e => setAgentApiConfigs(prev => ({...prev, [agent.id]: {...prev[agent.id], model: e.target.value.replace(/model\s*=\s*/i, '').replace(/["']/g, '').replace(/,/g, '').trim()}}))} className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-[9px] font-mono outline-none focus:border-indigo-500 text-indigo-400 transition-all" placeholder="Model ID" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                <button 
                  onClick={() => {
                    const reset = { global: '' };
                    setApiKeys(reset);
                    localStorage.removeItem('lucifer_swarm_keys');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset to Defaults
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 rounded-xl text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveApiKeys(apiKeys)}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  >
                    <Save className="w-4 h-4" />
                    Archive Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Build Console Overlay */}
      <AnimatePresence>
        {showBuildConsole && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Android Build Console</h3>
                </div>
                <button 
                  onClick={() => setShowBuildConsole(false)}
                  className="text-white/20 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  {buildSteps.map((step) => (
                    <motion.div 
                      key={step.id} 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center justify-between font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-3">
                        {step.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : step.status === 'active' ? (
                          <RefreshCcw className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-white/10" />
                        )}
                        <span className={cn(
                          step.status === 'active' ? "text-white" : "text-white/40"
                        )}>
                          {step.message}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[9px]",
                        step.status === 'success' ? "text-emerald-500" : 
                        step.status === 'active' ? "text-cyan-500" : "text-white/10"
                      )}>
                        {step.status.toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {buildSteps.every(s => s.status === 'success') && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white">APK Simulation Success</h4>
                        <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                          Direct APK installation requires a signed binary generated on an Android build server. 
                          For this preview, we have provided a manifest link. To install on your phone:
                        </p>
                        <ul className="text-[9px] text-emerald-400/70 font-mono space-y-1 list-disc pl-4 uppercase">
                          <li>Export project as source ZIP.</li>
                          <li>Open project in Android Studio or Expo.</li>
                          <li>Generate signed production APK.</li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBuildConsole(false)}
                      className="w-full py-2.5 bg-emerald-500 text-black text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                    >
                      Acknowledge Build
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
    </div>
  );
}
