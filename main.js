// Edzésnapló asztali ablak: a GitHub Pages-en futó appot tölti be, így minden frissítés azonnal megjelenik.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const APP_URL = 'https://kajmii.github.io/Edzesnaplo/';
const OFFLINE = 'data:text/html;charset=utf-8,' + encodeURIComponent(
  '<meta charset="utf-8"><body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#090b0e;color:#e4e4e7;font-family:system-ui">' +
  '<h2>Nincs internetkapcsolat</h2><p style="color:#a1a1aa">Az Edzésnapló használatához internet kell.</p>' +
  '<button onclick="location.href=\'' + APP_URL + '\'" style="padding:12px 24px;border:0;border-radius:12px;background:#a3e635;font-weight:700;font-size:16px;cursor:pointer">Újrapróbálom</button></body>'
);

function createWindow() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 460,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    backgroundColor: '#090b0e',
    title: 'Edzésnapló',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadURL(APP_URL);
  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    if (isMainFrame && code !== -3) win.loadURL(OFFLINE);
  });
  // külső linkek (YouTube, Google Naptár) az alapértelmezett böngészőben nyílnak
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank') return { action: 'allow' }; // PDF / nyomtatás nézet
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    const ok = url.startsWith(APP_URL) || url.startsWith('data:') || url.startsWith('https://agbicihwrzgzodwdvype.supabase.co');
    if (!ok) { e.preventDefault(); shell.openExternal(url); }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
