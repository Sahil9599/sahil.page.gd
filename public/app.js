const clock = document.querySelector('#clock');
const updateClock = () => { 
  if (!clock) return;
  clock.textContent = `IST — ${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())}`; 
};
updateClock(); 
setInterval(updateClock, 30000);

const output = document.querySelector('#terminalOutput'); 
const form = document.querySelector('#terminalForm'); 
const input = document.querySelector('#terminalInput'); 
const clear = document.querySelector('#clearTerminal');
const commandList = ['help','ls','pwd','whoami','uname -a','date','ip a','cat readme.md','skills','about','projects','certifications','education','contact','github','theme','nmap --help','clear'];
const lines = {
  help: ['Available simulated commands:', '  <b>projects</b> / <b>skills</b> / <b>about</b>       portfolio information', '  <b>certifications</b> / <b>education</b>       learning profile', '  <b>contact</b> / <b>github</b> / <b>theme</b>    quick actions', '  <b>ls</b>, <b>pwd</b>, <b>whoami</b>, <b>uname -a</b>, <b>date</b>, <b>ip a</b>  Linux-style basics', '  <b>cat readme.md</b>, <b>nmap --help</b>, <b>clear</b>', 'Use ↑/↓ for history and Tab to complete a command.'],
  ls: ['<span class="info">projects/</span>  <span class="info">notes/</span>  <span class="info">tools/</span>  readme.md  skills.txt'], 
  pwd: ['/home/zarki/portfolio/sahil.page.gd'], 
  whoami: ['zarki'], 
  'uname -a': ['Linux security-lab 6.8.0-lab #1 SMP x86_64 GNU/Linux <span class="info">(simulated)</span>'],
  date: [() => new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date())+' IST'], 
  'ip a': ['1: lo: &lt;LOOPBACK,UP&gt; mtu 65536', '    inet 127.0.0.1/8 scope host lo', '<span class="info">This browser terminal has no real network interfaces.</span>'],
  'cat readme.md': ['<span class="accent">SECURITY LAB POLICY</span>', 'This is a browser simulation for learning and portfolio display.', 'Only assess systems you own or have explicit permission to test.'],
  skills: ['<span class="accent">OFFENSIVE</span>  Recon · Web testing · Vulnerability assessment', '<span class="accent">DEFENSIVE</span>  Log analysis · Monitoring · Incident response', '<span class="accent">CORE</span>       Python · Linux · TCP/IP'],
  about: ['Cybersecurity student building practical foundations in offensive and defensive security.'], 
  projects: ['01 Network Recon Lab', '02 Password Vault Audit', '03 Threat Detection Dashboard', '<span class="info">Scroll to Selected Work or click a project card for details.</span>'], 
  certifications: ['<span class="accent">LEARNING PATH</span>', 'Add your verified certificates here: TryHackMe · Google Cybersecurity · Security+'], 
  education: ['Cybersecurity student · India · Class of 2026', '<span class="info">Replace this with your real college and degree.</span>'], 
  contact: ['Email: <span class="accent">zarki201432@gmail.com</span>', 'LinkedIn and GitHub links are available in the contact section.'], 
  github: ['Profile: <span class="accent">github.com/zarki201432</span>'], 
  theme: ['Press <b>t</b> anywhere to toggle the terminal light theme.'], 
  'nmap --help': ['<span class="accent">Nmap study note</span>', 'Nmap can discover hosts and services on authorized networks.', 'Practice only in your own lab, CTF environment, or with explicit permission.', 'This portfolio terminal does not scan or connect to targets.']
};

const add = (html, cls='') => { 
  if (!output) return;
  const p = document.createElement('p'); 
  p.className = cls; 
  p.innerHTML = html; 
  output.append(p); 
};

let history = []; 
let historyIndex = 0;

const run = raw => { 
  const command = raw.trim().toLowerCase().replace(/\s+/g,' '); 
  if (!command) return; 
  history.push(raw); 
  historyIndex = history.length; 
  add(`<span class="prompt">zarki@security-lab:~$</span> ${raw}`); 
  if (command === 'clear') { if (output) output.innerHTML=''; return; } 
  const reply = lines[command]; 
  if (reply) reply.forEach(line => add(typeof line==='function'?line():line)); 
  else add(`Command not available in this safe browser simulation: ${raw}. Type <b>help</b>.`,'error'); 
  if (output) output.scrollTop = output.scrollHeight; 
};

if (form && input) {
  form.addEventListener('submit', e => { 
    e.preventDefault(); 
    run(input.value); 
    input.value = ''; 
  }); 
}

if (clear && input) {
  clear.addEventListener('click', () => { 
    if (output) output.innerHTML = ''; 
    input.focus(); 
  });
}

if (input) {
  input.addEventListener('keydown', e => { 
    if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      historyIndex = Math.max(0, historyIndex - 1); 
      input.value = history[historyIndex] || ''; 
    } 
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      historyIndex = Math.min(history.length, historyIndex + 1); 
      input.value = history[historyIndex] || ''; 
    } 
    if (e.key === 'Tab') { 
      e.preventDefault(); 
      const match = commandList.find(c => c.startsWith(input.value.toLowerCase())); 
      if (match) input.value = match; 
    } 
  });
}

document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => { 
  run(btn.dataset.command); 
  if (input) input.focus(); 
}));
