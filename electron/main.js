const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let splashWindow;
let backendProcess;
let aiProcess;
let frontendProcess;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Simplified loading UI
  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <body style="margin:0; background: #0a0c10; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;">
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #6366f1;">LEDGERSPY</div>
      <div style="font-size: 10px; margin-top: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 1px;">Initializing Forensic Engine</div>
      <div style="margin-top: 20px; width: 200px; height: 2px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
        <div style="width: 100%; height: 100%; background: linear-gradient(90, #6366f1, #a855f7); animation: load 2s infinite linear;"></div>
      </div>
      <style>@keyframes load { from { transform: translateX(-100%); } to { transform: translateX(100%); } }</style>
    </body>
  `);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    backgroundColor: '#0a0c10',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Use the local Vite dev server during development, or file in production
  const url = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) splashWindow.close();
    mainWindow.show();
  });
}

const startServices = async () => {
  console.log('[Electron] Spawning Forensic Services...');

  // 1. Start Node.js Backend
  backendProcess = spawn('node', ['backend/server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: 4000 }
  });

  backendProcess.stdout.on('data', (data) => console.log(`[Backend]: ${data}`));

  // 2. Start Python AI Service
  const pythonPath = process.platform === 'win32' 
    ? 'ai-service/venv/Scripts/python.exe' 
    : 'ai-service/venv/bin/python';

  aiProcess = spawn(pythonPath, ['ai-service/app.py'], {
    cwd: path.join(__dirname, '..')
  });

  aiProcess.stdout.on('data', (data) => console.log(`[AI-Service]: ${data}`));

  // 3. Wait for ports 4000, 8000, and 5173 to be ready
  const opts = {
    resources: [
      'http://localhost:4000/health', 
      'http://localhost:8000/',
      'http://localhost:5173'
    ],
    timeout: 60000, // Increased to 60s for slow cold-starts
    interval: 500
  };

  try {
    console.log('[Electron] Monitoring subsystem heartbeat...');
    // Only spawn frontend in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('[Electron] Spawning Frontend Dev Server...');
        frontendProcess = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, '../frontend'),
            env: { ...process.env, PORT: 5173 }
        });
        frontendProcess.stdout.on('data', (data) => console.log(`[Frontend]: ${data}`));
    }

    await waitOn(opts);
    console.log('[Electron] All forensic subsystems are LIVE. Transitioning to UI.');
    createMainWindow();
  } catch (err) {
    console.error('[Electron] FOR CRITICAL: Orchestration timeout. One or more services failed to start.');
    console.error('[Electron] Diagnostic log:', err);
    app.quit();
  }
};

app.whenReady().then(() => {
  createSplash();
  startServices();
});

app.on('window-all-closed', () => {
  // Kill child processes on exit
  if (backendProcess) backendProcess.kill();
  if (aiProcess) aiProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  if (backendProcess) backendProcess.kill();
  if (aiProcess) aiProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});
