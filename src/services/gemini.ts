import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('youkta_agent_keys') || localStorage.getItem('lucifer_swarm_keys');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.global) return parsed.global;
    }
  }
  return process.env.GEMINI_API_KEY || "AIzaSyC3N3jxot-wZifofJuDsXd6QkiUwgENmWM";
};

export async function generateSwarmStep(
  agentName: string,
  context: string,
  instruction: string
) {
  const agentMap: Record<string, string> = {
    "Prime Lucifer": "ceo", "Architect X": "strategy", "Proto Dev": "game",
    "Final Judge": "qa", "Cyber Shield": "security", "Bug Hunter": "debugger",
    "Aegis Healer": "aegis", "Shape Shifter": "asset", "Canvas Master": "frontend",
    "Core Engine": "backend", "Cloud Forge": "build", "Linker Pro": "support",
    "Motion Weaver": "vfx-animation", "Nexus Github": "nexus",
    "Meta Weaver": "character-artist"
  };
  const agentId = agentMap[agentName] || agentName.toLowerCase().replace(/\s+/g, '-');

  const fallbackProfiles: Array<{ apiKey: string, apiConfig: any, sourceName: string }> = [];
  const addedKeys = new Set<string>();

  const addProfile = (key: string, config: any, sourceName: string) => {
    if (key && typeof key === 'string' && key.trim() !== '' && !addedKeys.has(key.trim())) {
      fallbackProfiles.push({ apiKey: key.trim(), apiConfig: config, sourceName });
      addedKeys.add(key.trim());
    }
  };

  let globalKey = getApiKey();
  const configStr = typeof window !== 'undefined' ? localStorage.getItem('youkta_api_config') : null;
  let globalConfig = configStr ? JSON.parse(configStr) : { provider: 'gemini', baseUrl: '', model: 'gemini-1.5-flash' };
  
  let parsedAgentConfigs: any = {};
  if (typeof window !== 'undefined') {
    const agentConfigsStr = localStorage.getItem('youkta_agent_api_configs');
    if (agentConfigsStr) {
      parsedAgentConfigs = JSON.parse(agentConfigsStr);
    }
  }

  const keysStr = typeof window !== 'undefined' ? (localStorage.getItem('youkta_agent_keys') || localStorage.getItem('lucifer_swarm_keys')) : null;
  const parsedKeys = keysStr ? JSON.parse(keysStr) : {};
  
  if (parsedKeys[agentId]) {
    addProfile(parsedKeys[agentId], parsedAgentConfigs[agentId] || globalConfig, agentName);
  }
  addProfile(globalKey, globalConfig, 'Main Global Key');
  
  for (const [kId, kVal] of Object.entries(parsedKeys)) {
    if (kId !== 'global' && kId !== agentId && kId !== 'meshy' && kId !== 'luma' && kId !== 'elevenlabs' && kId !== 'github_token') {
      addProfile(kVal as string, parsedAgentConfigs[kId] || globalConfig, `${kId} Key`);
    }
  }

  if (fallbackProfiles.length === 0) {
    throw new Error("API_KEY is not set. Please add it in settings or environment variables.");
  }

  const prompt = `
    You are the "${agentName}" in the "YOUKTA SWARM FACTORY".
    The user instruction is: "${instruction}"
    Note: The instruction might be in English, Hindi, or Hinglish (a mix of Hindi and English words). Please understand and process Hinglish naturally.
    
    Current project state and logs:
    ${context}
    
    ROLE-SPECIFIC TASK:
    - If you are "Nexus Github", simulate a successful deployment flow. Provide a "message" stating that the repository has been created and the project is live, and include a simulated Live URL in the "output".
    - If you are "Linker Pro", finalize the project summary and offer the user download links for ZIP (Source) and APK (App). Acknowledge any feedback they gave.
    - If you are "Prime Lucifer" (CEO), analyze the user's instruction. If the request is flawed, incomplete, or illogical, AUTONOMOUSLY CORRECT IT. Act as a self-learning system: adapt the strategy, fix user mistakes, and ensure all other nodes receive a perfect, functional direction. 
    - If you are "Motion Weaver" (VFX Director), output pure JavaScript (using Three.js, HTML5 Canvas, or CSS logic) to add particle effects, screen shake, and smooth animations.
    - If you are "Meta Weaver" (Realistic Character Agent), generate advanced C# scripts for Inverse Kinematics (IK), Ragdoll physics, and Animator controllers compatible with Mixamo or MetaHuman.
    - If the user provided feedback (look for USER_FEEDBACK), adjust your logic accordingly for the revision loop.
    
    Based on your role, provide a short update on what you are doing. 
    If you are generating code or assets, provide a brief snippet or description.
    Keep your response concise and professional, like an agent in a factory swarm.
    Format your response as JSON:
    {
      "status": "Thinking" | "Coding" | "Fixing" | "Ready",
      "message": "Human readable update",
      "output": "Optional code snippet or asset details"
    }
  `;

  const MAX_RETRIES = 5;
  let retryCount = 0;
  let currentProfileIndex = 0;
  let fallbackNotification = "";

  while (retryCount < MAX_RETRIES) {
    const currentProfile = fallbackProfiles[currentProfileIndex];
    const apiKey = currentProfile.apiKey;
    const apiConfig = currentProfile.apiConfig;
    const isCustom = apiConfig.provider !== 'gemini';
    const genAI = isCustom ? null : new GoogleGenAI({ apiKey });
    const model = isCustom ? apiConfig.model : (apiConfig.model || "gemini-1.5-flash");

    try {
      if (isCustom) {
        const baseUrl = (apiConfig.baseUrl || '').trim().replace(/\/$/, '');
        let modelName = (model || '').trim();
        if (modelName.includes('safety-guard')) modelName = 'meta/llama3-70b-instruct';
        try {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ 
              model: modelName, 
              messages: [{ role: 'system', content: prompt }],
              ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {})
            })
          });
          const data = await res.json();
          if (!res.ok) {
            const errorMsg = data.error?.message || data.detail || data.message || data.error || `Request failed: ${res.status}`;
            throw new Error(errorMsg);
          }
          
          let content = data.choices?.[0]?.message?.content || "{}";
          if (content.includes('"User Safety"')) {
            throw new Error("Safety Guard model used instead of Instruct model. Please fix the Model ID in Settings.");
          }
          try {
            const match = content.match(/\{[\s\S]*\}/);
            if (match) content = match[0];
            else content = content.replace(/```json/i, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(content);
            if (currentProfileIndex > 0) parsed.message = fallbackNotification + (parsed.message || '');
            return parsed;
          } catch (e) {
            return { status: "Ready", message: fallbackNotification + "Module processed successfully.", output: content };
          }
        } catch (fetchErr: any) {
          if (fetchErr.message === 'Failed to fetch' || fetchErr.message.includes('NetworkError')) {
            const proxyRes = await fetch('http://localhost:3001/api/proxy/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                url: `${baseUrl}/chat/completions`, 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, 
                body: { model: modelName, messages: [{ role: 'system', content: prompt }], ...(modelName.includes('deepseek') ? { temperature: 1, top_p: 0.95, max_tokens: 16384, chat_template_kwargs: { thinking: false } } : {}) } 
              })
            });
            const data = await proxyRes.json();
            if (!proxyRes.ok) {
              const errorMsg = data.error?.message || data.detail || data.message || data.error || `Request failed: ${proxyRes.status}`;
              throw new Error(errorMsg);
            }
            if (data.error && data.error.message) throw new Error(data.error.message);
            
            let content = data.choices?.[0]?.message?.content || "{}";
            if (content.includes('"User Safety"')) {
              throw new Error("Safety Guard model used instead of Instruct model. Please fix the Model ID in Settings.");
            }
            try {
              const match = content.match(/\{[\s\S]*\}/);
              if (match) content = match[0];
              else content = content.replace(/```json/i, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(content);
              if (currentProfileIndex > 0) parsed.message = fallbackNotification + (parsed.message || '');
              return parsed;
            } catch (e) {
              return { status: "Ready", message: fallbackNotification + "Module processed successfully.", output: content };
            }
          } else {
            throw fetchErr;
          }
        }
      } else {
        const response = await genAI!.models.generateContent({
          model,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
          }
        });
        try {
          const parsed = JSON.parse(response.text || "{}");
          if (currentProfileIndex > 0) parsed.message = fallbackNotification + (parsed.message || '');
          return parsed;
        } catch (e) {
          return { status: "Ready", message: fallbackNotification + "Module processed successfully.", output: response.text };
        }
      }
    } catch (error: any) {
      const isFallbackable = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("401") || error?.message?.includes("403") || error?.message?.toLowerCase().includes("key") || error?.message?.includes("models/") || error?.message?.toLowerCase().includes("not found");
      
      if (isFallbackable && currentProfileIndex < fallbackProfiles.length - 1) {
        currentProfileIndex++;
        console.warn(`[YOUKTA SWARM FACTORY] ${currentProfile.sourceName} failed. Seamlessly routing to ${fallbackProfiles[currentProfileIndex].sourceName}.`);
        fallbackNotification = `⚠️ [Switched to ${fallbackProfiles[currentProfileIndex].sourceName}] `;
        continue;
      }

      const isRateLimit = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.toLowerCase().includes("high demand") || error?.message?.includes("503");
      if (isRateLimit && retryCount < MAX_RETRIES - 1) {
        retryCount++;
        // Enhanced backoff: (base * multiplier^retry) + jitter
        // 1st retry: ~5-7s, 2nd: ~15-20s, 3rd: ~45-55s
        const baseDelay = Math.pow(3, retryCount) * 2000; 
        const jitter = Math.random() * 2000;
        const delay = baseDelay + jitter;
        
        console.warn(`[YOUKTA SWARM FACTORY] Quota limit for ${agentName}. Cooling down for ${Math.round(delay)}ms... (Attempt ${retryCount})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      console.error(`[YOUKTA SWARM FACTORY] Error in ${agentName}:`, error);
      return {
        status: "Fixing",
        message: (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.toLowerCase().includes("quota"))
          ? "CRITICAL: Neural Overload (429 Quota). Initiating self-healing shutdown to prevent core melt-down." 
          : "NEURAL_GLITCH: Processing failure. Routing to Aegis Healer for restoration.",
        output: JSON.stringify(error?.response || error) // Include error details for the healer
      };
    }
  }

  return { status: "Fixing", message: "Maximum retries exceeded." };
}
