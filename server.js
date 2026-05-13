import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));

app.post('/api/save-project', (req, res) => {
  try {
    const { projectName, files } = req.body;
    const baseDir = path.join(process.cwd(), 'exports', (projectName || 'AI_Project').replace(/[^a-zA-Z0-9_-]/g, '_'));
    
    files.forEach(file => {
      const filePath = path.join(baseDir, file.path || file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content);
    });
    res.json({ success: true, path: baseDir });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate-asset', async (req, res) => {
  const { prompt, type, apiKey, projectPath } = req.body;
  try {
    if (type === 'CHARACTER_MODEL' && apiKey) {
      console.log(`[ASSET FORGE] Requesting AAA Character from Meshy API: ${prompt}`);
      const response = await fetch('https://api.meshy.ai/v2/text-to-3d', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview', prompt: `Ultra-realistic AAA game character, highly detailed face, humanoid rigged, Unreal Engine 5 quality, 8k textures. Base concept: ${prompt}`, art_style: 'realistic', should_remesh: true })
      });
      const data = await response.json();
      return res.json({ success: true, message: `AAA Character Task Initiated: ${data.result || 'Pending'}` });
    }
    // Meshy 3D API Integration
    else if (type === '3D_MODEL' && apiKey) {
      console.log(`[ASSET FORGE] Requesting 3D Model from Meshy API: ${prompt}`);
      const response = await fetch('https://api.meshy.ai/v2/text-to-3d', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview', prompt, art_style: 'realistic', should_remesh: true })
      });
      const data = await response.json();
      res.json({ success: true, message: `Meshy API Task Initiated: ${data.result || 'Pending'}` });
    } else {
      res.json({ success: false, message: "Asset API Key missing or unsupported type." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/compile-project', (req, res) => {
  const { projectPath, engine } = req.body;
  let cmd = '';
  
  // Scaffolding check
  const hasGodot = fs.existsSync(path.join(projectPath, 'project.godot'));
  const hasUnity = fs.existsSync(path.join(projectPath, 'ProjectSettings')) || fs.existsSync(path.join(projectPath, 'Assets'));

  if (engine.toUpperCase().includes('UNITY') && !hasUnity) {
    return res.status(400).json({ error: "Unity scaffold not detected in project folder." });
  } else if (engine.toUpperCase().includes('GODOT') && !hasGodot) {
    return res.status(400).json({ error: "Godot scaffold (project.godot) not detected in project folder." });
  }

  // Setup actual CLI compilation commands for desktop engines
  const buildDir = path.join(projectPath, 'Builds');
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  if (engine.toUpperCase().includes('UNITY')) {
    // Assumes Unity is installed in default Windows path (Adjust if needed)
    cmd = `"C:\\Program Files\\Unity\\Hub\\Editor\\2022.3.10f1\\Editor\\Unity.exe" -quit -batchmode -projectPath "${projectPath}" -buildWindowsPlayer "${path.join(buildDir, 'Game.exe')}"`;
  } else if (engine.toUpperCase().includes('GODOT')) {
    // Assumes Godot is added to system PATH
    cmd = `godot --headless --path "${projectPath}" --export-release "Windows Desktop" "${path.join(buildDir, 'Game.exe')}"`;
  } else if (engine.toUpperCase().includes('ANDROID')) {
    cmd = `cd "${projectPath}" && gradlew assembleRelease`;
  } else {
    cmd = `echo Compilation step triggered for ${engine} but no native compiler path found. && timeout 2`;
  }

  console.log(`[COMPILER] Executing Build Command: ${cmd}`);
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.warn(`[COMPILER WARNING] ${error.message}. Ensure the Engine is installed and in PATH.`);
      return res.status(500).json({ error: "Compiler executable not found or build failed.", logs: stderr });
    }
    res.json({ success: true, buildPath: buildDir, logs: stdout });
  });
});

app.post('/api/proxy/chat', async (req, res) => {
  const { url, headers, body } = req.body;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'User-Agent': 'Youkta-Swarm-Local-Proxy/1.0'
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    try {
      res.status(response.status).json(JSON.parse(text));
    } catch (e) {
      const preview = text ? text.substring(0, 150).replace(/\n/g, ' ').trim() : response.statusText;
      res.status(response.status).json({ error: `API Error ${response.status}: ${preview}`, text });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('LUCIFER SWARM LOCAL BACKEND RUNNING ON PORT 3001 | Creator: Youbaraj'));