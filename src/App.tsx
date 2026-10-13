import React, { useState, useEffect, useRef } from 'react';
import {
  Github,
  Download,
  ExternalLink,
  Copy,
  Check,
  Terminal as TerminalIcon,
  FolderGit2,
  X,
  Shield,
  Sun,
  Moon,
  Mail,
  Linkedin
} from 'lucide-react';

interface ProjectDetail {
  tag: string;
  title: string;
  objective: string;
  tools: string;
  setup: string;
  learned: string;
  link: string;
}

interface PostDetail {
  tag: string;
  title: string;
  text: string;
}

const PROJECT_DATA: Record<string, ProjectDetail> = {
  recon: {
    tag: 'PROJECT / 01',
    title: 'Network Recon Lab',
    objective: 'Map the exposed services of an intentionally vulnerable local lab machine before planning any remediation.',
    tools: 'Nmap, Wireshark, Linux',
    setup: 'Two local virtual machines on an isolated host-only network. No public targets were scanned.',
    learned: 'Service enumeration is only the start: context, validation, and responsible documentation matter.',
    link: 'https://github.com/Sahil9599/sahil.page.gd'
  },
  vault: {
    tag: 'PROJECT / 02',
    title: 'Password Vault Audit',
    objective: 'Review a demo password-vault design through an OWASP-informed threat-modeling lens.',
    tools: 'OWASP ASVS, threat modeling, browser developer tools',
    setup: 'A locally hosted demo application and a written threat-model worksheet.',
    learned: 'Strong authentication is a system of choices—not a single feature.',
    link: 'https://github.com/Sahil9599/sahil.page.gd'
  },
  detect: {
    tag: 'PROJECT / 03',
    title: 'Threat Detection Dashboard',
    objective: 'Turn sample security events into a small dashboard that highlights unusual activity.',
    tools: 'Python, Splunk, SIEM concepts',
    setup: 'Synthetic logs and benign security events processed locally.',
    learned: 'Useful alerting is about reducing noise and giving analysts context.',
    link: 'https://github.com/Sahil9599/sahil.page.gd'
  }
};

const POSTS_DATA: Record<string, PostDetail> = {
  nmap: {
    tag: 'LAB NOTES / 01',
    title: 'My first Nmap lab',
    text: 'A first scan is not a verdict. It is a starting point for understanding the services intentionally exposed in a lab and documenting what they mean.'
  },
  wireshark: {
    tag: 'NETWORKING / 02',
    title: 'How I learned Wireshark basics',
    text: 'Start with a small capture, apply one filter at a time, and follow a single conversation. Packet analysis becomes less intimidating when you focus on a question.'
  },
  owasp: {
    tag: 'WEB SECURITY / 03',
    title: 'OWASP Top 10 notes',
    text: 'The OWASP Top 10 works best as a learning map: understand the risk, recognize the pattern, and practice a defensive control in an authorized lab.'
  }
};

interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'accent' | 'info' | 'error';
  content: string;
}

export default function App() {
  const [clockTime, setClockTime] = useState<string>('IST — 00:00');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [terminalLight, setTerminalLight] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: 'project' | 'post' | 'github';
    data?: ProjectDetail | PostDetail;
  } | null>(null);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [formFeedback, setFormFeedback] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: '1', type: 'prompt', content: 'zarki@security-lab:~$ welcome' },
    { id: '2', type: 'accent', content: "Welcome to Zarki's safe portfolio lab terminal." },
    { id: '3', type: 'output', content: "Type 'help' to view commands. Use ↑/↓ for history or Tab to auto-complete." }
  ]);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      try {
        const ist = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        setClockTime(`IST — ${ist}`);
      } catch {
        const now = new Date();
        setClockTime(`IST — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Cursor glow
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Keyboard shortcut 't' to toggle terminal theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't' && document.activeElement !== inputRef.current) {
        setTerminalLight(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto scroll terminal
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const commandList = [
    'help', 'ls', 'pwd', 'whoami', 'uname -a', 'date', 'ip a',
    'cat readme.md', 'skills', 'about', 'projects', 'certifications',
    'education', 'contact', 'github', 'repo', 'theme', 'nmap --help', 'clear'
  ];

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;

    setHistory(prev => [...prev, raw]);
    setHistoryIndex(-1);

    const newLines: TerminalLine[] = [
      { id: Math.random().toString(), type: 'prompt', content: `zarki@security-lab:~$ ${raw}` }
    ];

    if (cmd === 'clear') {
      setTerminalLines([]);
      return;
    }

    switch (cmd) {
      case 'help':
        newLines.push(
          { id: Math.random().toString(), type: 'output', content: 'Available simulated commands:' },
          { id: Math.random().toString(), type: 'output', content: '  projects / skills / about         portfolio information' },
          { id: Math.random().toString(), type: 'output', content: '  certifications / education        learning profile' },
          { id: Math.random().toString(), type: 'output', content: '  contact / github / repo           quick links and github setup' },
          { id: Math.random().toString(), type: 'output', content: '  ls, pwd, whoami, uname -a, date   Linux environment commands' },
          { id: Math.random().toString(), type: 'output', content: '  ip a, cat readme.md, nmap --help  security lab commands' },
          { id: Math.random().toString(), type: 'output', content: '  theme, clear                      terminal utility' }
        );
        break;

      case 'ls':
        newLines.push({
          id: Math.random().toString(),
          type: 'info',
          content: 'projects/   notes/   tools/   readme.md   skills.txt   sahil.page.gd/'
        });
        break;

      case 'pwd':
        newLines.push({ id: Math.random().toString(), type: 'output', content: '/home/zarki/portfolio/sahil.page.gd' });
        break;

      case 'whoami':
        newLines.push({ id: Math.random().toString(), type: 'output', content: 'zarki' });
        break;

      case 'uname -a':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          content: 'Linux security-lab 6.8.0-lab #1 SMP x86_64 GNU/Linux (simulated environment)'
        });
        break;

      case 'date':
        try {
          const formatted = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Kolkata'
          }).format(new Date());
          newLines.push({ id: Math.random().toString(), type: 'output', content: `${formatted} IST` });
        } catch {
          newLines.push({ id: Math.random().toString(), type: 'output', content: new Date().toUTCString() });
        }
        break;

      case 'ip a':
        newLines.push(
          { id: Math.random().toString(), type: 'output', content: '1: lo: <LOOPBACK,UP> mtu 65536' },
          { id: Math.random().toString(), type: 'output', content: '    inet 127.0.0.1/8 scope host lo' },
          { id: Math.random().toString(), type: 'info', content: '⚡ This browser terminal has no real network interfaces.' }
        );
        break;

      case 'cat readme.md':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'SECURITY LAB POLICY' },
          { id: Math.random().toString(), type: 'output', content: 'This is a browser simulation for cybersecurity learning and portfolio demonstration.' },
          { id: Math.random().toString(), type: 'output', content: 'Only assess systems you own or have explicit authorization to test.' }
        );
        break;

      case 'skills':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'OFFENSIVE:  Recon · Web testing · Vulnerability assessment (Burp, Nmap, Metasploit)' },
          { id: Math.random().toString(), type: 'accent', content: 'DEFENSIVE:  Log analysis · Network monitoring · SIEM concepts (Wireshark, Splunk)' },
          { id: Math.random().toString(), type: 'accent', content: 'CORE:       Python · Linux · Git · TCP/IP' }
        );
        break;

      case 'about':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          content: "Cybersecurity student building practical foundations in offensive and defensive security. Class of 2026."
        });
        break;

      case 'projects':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: '01  Network Recon Lab (Nmap, Wireshark, Linux)' },
          { id: Math.random().toString(), type: 'accent', content: '02  Password Vault Audit (OWASP ASVS, threat modeling)' },
          { id: Math.random().toString(), type: 'accent', content: '03  Threat Detection Dashboard (Python, Splunk, SIEM)' },
          { id: Math.random().toString(), type: 'info', content: 'Tip: Click on project cards in the Selected Work section for full lab notes.' }
        );
        break;

      case 'certifications':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'LEARNING PATH / CREDENTIALS:' },
          { id: Math.random().toString(), type: 'output', content: '• Google Cybersecurity Professional Certificate' },
          { id: Math.random().toString(), type: 'output', content: '• TryHackMe / HackTheBox Labs' },
          { id: Math.random().toString(), type: 'output', content: '• CompTIA Security+ (In progress)' }
        );
        break;

      case 'education':
        newLines.push(
          { id: Math.random().toString(), type: 'output', content: 'Cybersecurity Student · India · Class of 2026' }
        );
        break;

      case 'contact':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'Email: zarki201432@gmail.com' },
          { id: Math.random().toString(), type: 'output', content: 'GitHub: github.com/Sahil9599' },
          { id: Math.random().toString(), type: 'output', content: 'LinkedIn: linkedin.com/in/Sahil9599/' }
        );
        break;

      case 'github':
        newLines.push({
          id: Math.random().toString(),
          type: 'accent',
          content: 'GitHub Profile: https://github.com/Sahil9599'
        });
        break;

      case 'repo':
      case 'sahil.page.gd':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'REPOSITORY TARGET: sahil.page.gd' },
          { id: Math.random().toString(), type: 'output', content: 'Run in your local terminal to push to your repository:' },
          { id: Math.random().toString(), type: 'info', content: 'git remote add origin https://github.com/Sahil9599/sahil.page.gd.git' },
          { id: Math.random().toString(), type: 'info', content: 'git push -u origin main' },
          { id: Math.random().toString(), type: 'output', content: "Click 'Upload to sahil.page.gd' in the top header to view the full GitHub push guide." }
        );
        break;

      case 'theme':
        setTerminalLight(prev => !prev);
        newLines.push({
          id: Math.random().toString(),
          type: 'info',
          content: `Switched terminal theme. (Press 't' anytime to toggle)`
        });
        break;

      case 'nmap --help':
        newLines.push(
          { id: Math.random().toString(), type: 'accent', content: 'Nmap Study Note & Ethics:' },
          { id: Math.random().toString(), type: 'output', content: 'Nmap discovers hosts, exposed ports, and running services.' },
          { id: Math.random().toString(), type: 'output', content: 'Only practice against authorized hosts in your own sandbox or CTFs.' },
          { id: Math.random().toString(), type: 'info', content: 'This portfolio terminal is an isolated client-side simulation.' }
        );
        break;

      default:
        newLines.push({
          id: Math.random().toString(),
          type: 'error',
          content: `Command not found: '${raw}'. Type 'help' for available commands or 'repo' for sahil.page.gd push instructions.`
        });
        break;
    }

    setTerminalLines(prev => [...prev, ...newLines]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    runCommand(terminalInput);
    setTerminalInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setTerminalInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < history.length) {
          setHistoryIndex(nextIndex);
          setTerminalInput(history[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setTerminalInput('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = terminalInput.trim().toLowerCase();
      if (!val) return;
      const match = commandList.find(c => c.startsWith(val));
      if (match) {
        setTerminalInput(match);
      }
    }
  };

  const copyGitCommands = () => {
    const commands = `git init
git add .
git commit -m "Deploy sahil.page.gd portfolio"
git branch -M main
git remote add origin https://github.com/Sahil9599/sahil.page.gd.git
git push -u origin main`;
    navigator.clipboard.writeText(commands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    setFormFeedback(`Thanks, ${name || 'friend'} — message recorded. Please send directly to zarki201432@gmail.com for prompt reply!`);
    form.reset();
  };

  return (
    <div className={terminalLight ? 'terminal-light' : ''}>
      <div className="noise" aria-hidden="true" />
      <div
        className="cursor-glow"
        aria-hidden="true"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {/* Header */}
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Zarki home">
          <span>Z</span> / SEC
        </a>

        <button
          className="menu-button"
          type="button"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          MENU <span />
        </button>

        <nav className={mobileMenuOpen ? 'open' : ''} aria-label="Main navigation">
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#lab" onClick={() => setMobileMenuOpen(false)}>Terminal Lab</a>
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>Projects</a>
          <a href="#journal" onClick={() => setMobileMenuOpen(false)}>Writeups</a>
          <a href="#skills" onClick={() => setMobileMenuOpen(false)}>Skills</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </nav>

        <div className="header-actions">
          <button
            className="github-deploy-pill"
            type="button"
            onClick={() => setActiveModal({ type: 'github' })}
            title="Upload instructions for sahil.page.gd"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-lime-400" />
            <span>sahil.page.gd</span>
          </button>

          <a
            className="social-icon"
            href="https://github.com/Sahil9599"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <Github className="w-3.5 h-3.5" />
          </a>

          <a className="contact-link" href="#contact">
            LET'S TALK <i className="not-italic ml-1">↗</i>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main id="top">
        {/* Hero Section */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />

          <p className="eyebrow status">
            <span /> Open to internships & CTF collaborations · 2026
          </p>

          <div className="hero-copy">
            <p className="kicker">CYBERSECURITY STUDENT / ETHICAL HACKER IN TRAINING</p>
            <h1 id="hero-title">
              DEFEND<br />
              <em>WHAT</em><br />
              MATTERS<span>.</span>
            </h1>
          </div>

          <div className="hero-bottom">
            <p>
              Learning how systems break<br />
              so I can help make them stronger.
            </p>
            <a className="circle-link" href="#about" aria-label="Explore portfolio">
              ↓
            </a>
            <p className="location">
              INDIA · <span id="clock">{clockTime}</span>
            </p>
          </div>
        </section>

        {/* Marquee Ticker */}
        <section className="marquee" aria-label="Areas of interest">
          <div>
            NETWORK SECURITY <b>✦</b> PENETRATION TESTING <b>✦</b> DIGITAL FORENSICS <b>✦</b> SECURITY RESEARCH <b>✦</b> NETWORK SECURITY <b>✦</b> PENETRATION TESTING <b>✦</b> DIGITAL FORENSICS <b>✦</b> SECURITY RESEARCH <b>✦</b>
          </div>
        </section>

        {/* About Section */}
        <section className="intro section" id="about">
          <p className="eyebrow">01 / ABOUT ME</p>
          <div className="intro-content">
            <div>
              <h2>Zarki, a security student with a builder's mindset.</h2>
              <div className="identity-tags">
                <span>CYBERSECURITY STUDENT</span>
                <span>CLASS OF 2026</span>
                <span>INDIA</span>
                <span>SAHIL.PAGE.GD</span>
              </div>
            </div>

            <div className="bio-side">
              <div className="avatar" aria-label="Stylized Zarki cyber avatar">
                <span>Z</span>
                <i />
                <b>ONLINE</b>
              </div>

              <div>
                <p>
                  I'm Zarki (Sahil), a cybersecurity student interested in both finding weaknesses and helping prevent them. My learning happens in authorized labs, CTFs, writeups, and small tools built to understand how security works.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <a className="text-link" href="/zarki-resume.txt" download="zarki-resume.txt">
                    DOWNLOAD RÉSUMÉ <Download className="w-3.5 h-3.5 inline ml-1" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveModal({ type: 'github' })}
                    className="text-link text-xs cursor-pointer bg-transparent border-0"
                  >
                    GITHUB REPO (sahil.page.gd) <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="profile-note">
            Target Repository: <strong>github.com/Sahil9599/sahil.page.gd</strong> · Certifications: <strong>Google Cybersecurity / TryHackMe / CompTIA Security+ (In Progress)</strong>
          </p>
        </section>

        {/* Interactive Lab Terminal */}
        <section className="lab section" id="lab">
          <div className="lab-heading">
            <div>
              <p className="eyebrow">02 / INTERACTIVE LAB</p>
              <h2>Try the<br />terminal.</h2>
            </div>
            <p>
              Simulated learning environment.<br />
              No network access. No real commands run.
            </p>
          </div>

          <div className="terminal-shell">
            <div className="shell-bar">
              <div>
                <i />
                <i />
                <i />
              </div>
              <span>zarki@security-lab: ~/portfolio/sahil.page.gd</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTerminalLight(!terminalLight)}
                  title="Toggle theme (Hotkey: t)"
                  className="flex items-center gap-1 opacity-80 hover:opacity-100"
                >
                  {terminalLight ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  {terminalLight ? 'DARK' : 'LIGHT'}
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalLines([])}
                >
                  CLEAR
                </button>
              </div>
            </div>

            <div className="terminal-output" ref={terminalOutputRef} aria-live="polite">
              {terminalLines.map(line => {
                if (line.type === 'prompt') {
                  return (
                    <p key={line.id}>
                      <span className="prompt">zarki@security-lab:~$</span> {line.content.replace(/^zarki@security-lab:~\$\s*/, '')}
                    </p>
                  );
                }
                return (
                  <p key={line.id} className={line.type}>
                    {line.content}
                  </p>
                );
              })}
            </div>

            <form className="terminal-form" onSubmit={handleTerminalSubmit}>
              <label className="prompt" htmlFor="terminalInput">
                zarki@security-lab:~$
              </label>
              <input
                id="terminalInput"
                ref={inputRef}
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal command"
                placeholder="try: help, projects, repo, ls"
              />
            </form>
          </div>

          <p className="lab-hint">
            TRY COMMANDS:
            <button type="button" onClick={() => runCommand('help')}>help</button>
            <button type="button" onClick={() => runCommand('projects')}>projects</button>
            <button type="button" onClick={() => runCommand('skills')}>skills</button>
            <button type="button" onClick={() => runCommand('certifications')}>certifications</button>
            <button type="button" onClick={() => runCommand('repo')}>repo (sahil.page.gd)</button>
            <button type="button" onClick={() => runCommand('theme')}>theme</button>
          </p>
        </section>

        {/* Selected Work (Projects) */}
        <section className="projects section" id="work">
          <div className="section-heading">
            <p className="eyebrow">03 / SELECTED WORK</p>
            <div>
              <a
                className="github-button"
                href="https://github.com/Sahil9599"
                target="_blank"
                rel="noreferrer"
              >
                VIEW GITHUB ↗
              </a>
              <p>Click any project for deep-dive lab notes.</p>
            </div>
          </div>

          <div className="project-grid">
            {/* Project 01 - Large */}
            <button
              className="project project-large"
              type="button"
              onClick={() => setActiveModal({ type: 'project', data: PROJECT_DATA.recon })}
            >
              <div className="project-art terminal">
                <div className="terminal-top">
                  <i /><i /><i />
                  <span>network_scan.sh</span>
                </div>
                <p><span>$</span> nmap -sV -sC target.local</p>
                <p className="muted">22/tcp &nbsp; open &nbsp; ssh (OpenSSH 8.9p1)</p>
                <p className="muted">80/tcp &nbsp; open &nbsp; http (nginx 1.18.0)</p>
                <p className="blue">scan complete: 2 services identified_</p>
              </div>
              <span className="project-meta">
                <small>01</small>
                <strong>Network Recon Lab</strong>
                <em>Nmap · Wireshark · Linux Sandbox</em>
                <b>↗</b>
              </span>
            </button>

            {/* Project 02 */}
            <button
              className="project"
              type="button"
              onClick={() => setActiveModal({ type: 'project', data: PROJECT_DATA.vault })}
            >
              <div className="project-art lock">
                <div className="lock-body">⌁</div>
                <div className="orbit orbit-a" />
                <div className="orbit orbit-b" />
                <small>ENCRYPTED</small>
              </div>
              <span className="project-meta">
                <small>02</small>
                <strong>Password Vault Audit</strong>
                <em>OWASP ASVS · Threat Modeling</em>
                <b>↗</b>
              </span>
            </button>

            {/* Project 03 */}
            <button
              className="project"
              type="button"
              onClick={() => setActiveModal({ type: 'project', data: PROJECT_DATA.detect })}
            >
              <div className="project-art radar">
                <div className="radar-ring r1" />
                <div className="radar-ring r2" />
                <div className="radar-ring r3" />
                <div className="sweep" />
                <i className="blip b1" />
                <i className="blip b2" />
                <i className="blip b3" />
                <span>MONITORING<br />ACTIVE</span>
              </div>
              <span className="project-meta">
                <small>03</small>
                <strong>Threat Detection Dashboard</strong>
                <em>Python · Splunk · SIEM Logic</em>
                <b>↗</b>
              </span>
            </button>
          </div>
        </section>

        {/* Security Journal */}
        <section className="journal section" id="journal">
          <div className="section-heading">
            <p className="eyebrow">04 / SECURITY JOURNAL</p>
            <p>Notes and writeups from continuous lab practice.</p>
          </div>

          <div className="post-grid">
            <article>
              <span>LAB NOTES / 01</span>
              <h3>My first Nmap lab</h3>
              <p>What a basic service scan taught me about mapping an authorized target.</p>
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'post', data: POSTS_DATA.nmap })}
              >
                READ NOTE ↗
              </button>
            </article>

            <article>
              <span>NETWORKING / 02</span>
              <h3>How I learned Wireshark basics</h3>
              <p>A beginner's approach to following packets and understanding raw traffic flows.</p>
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'post', data: POSTS_DATA.wireshark })}
              >
                READ NOTE ↗
              </button>
            </article>

            <article>
              <span>WEB SECURITY / 03</span>
              <h3>OWASP Top 10 notes</h3>
              <p>My working checklist for understanding and preventing common web application risks.</p>
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'post', data: POSTS_DATA.owasp })}
              >
                READ NOTE ↗
              </button>
            </article>
          </div>
        </section>

        {/* Toolkit Section */}
        <section className="skills section" id="skills">
          <div className="skills-title">
            <p className="eyebrow">05 / TOOLKIT</p>
            <h2>Always<br />learning.</h2>
          </div>

          <div className="skill-list">
            <article>
              <span>01</span>
              <h3>Offensive Security</h3>
              <p>Reconnaissance, web application assessment, vulnerability validation, and technical documentation.</p>
              <div>Burp Suite · Nmap · Metasploit · OWASP ZAP</div>
            </article>

            <article>
              <span>02</span>
              <h3>Defensive Security</h3>
              <p>Log analysis, network monitoring, incident response fundamentals, and baseline system hardening.</p>
              <div>Wireshark · Splunk · SIEM · Linux Auditing</div>
            </article>

            <article>
              <span>03</span>
              <h3>Core Technologies</h3>
              <p>Building a solid engineering foundation across operating systems, scripting, and protocols.</p>
              <div>Python · Bash · Linux · Git · TCP/IP · Vite/React</div>
            </article>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact section" id="contact">
          <p className="eyebrow">06 / CONTACT</p>
          <div className="contact-grid">
            <div>
              <h2>Have a challenge<br />worth securing?</h2>
              <div className="social-links">
                <a href="mailto:zarki201432@gmail.com">
                  <Mail className="w-3.5 h-3.5 inline mr-1" /> EMAIL ↗
                </a>
                <a href="https://github.com/Sahil9599" target="_blank" rel="noreferrer">
                  <Github className="w-3.5 h-3.5 inline mr-1" /> GITHUB ↗
                </a>
                <a href="https://www.linkedin.com/in/Sahil9599/" target="_blank" rel="noreferrer">
                  <Linkedin className="w-3.5 h-3.5 inline mr-1" /> LINKEDIN ↗
                </a>
              </div>
            </div>

            <form className="contact-form" id="contactForm" onSubmit={handleContactSubmit}>
              <label>
                Name
                <input name="name" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input name="email" type="email" required placeholder="you@example.com" />
              </label>
              <label>
                Message
                <textarea name="message" required placeholder="How can I help or collaborate?" />
              </label>
              <button type="submit">SEND MESSAGE ↗</button>
              {formFeedback && (
                <p id="formMessage" role="status">
                  {formFeedback}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <span>© 2026 ZARKI (SAHIL)</span>
        <span>REPOSITORY: sahil.page.gd</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      {/* Detail Modal (Project / Post / GitHub instructions) */}
      {activeModal && (
        <div
          className="modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Close dialog"
            >
              <X className="w-6 h-6" />
            </button>

            {/* GitHub Repo Setup Modal */}
            {activeModal.type === 'github' && (
              <div className="modal-inner">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-lime-400" /> REPOSITORY: sahil.page.gd
                </span>
                <h2>Upload Website to <span className="text-lime-400">sahil.page.gd</span></h2>
                
                <p>
                  Because GitHub requires your account authentication (Personal Access Token or SSH key) to write to your repository, you have <strong>3 easy ways</strong> to complete the upload:
                </p>

                <div className="my-5 p-4 bg-lime-950/30 border border-lime-500/40 rounded">
                  <h3 className="!mt-0 text-lime-400 font-bold">METHOD 1: LET ME PUSH FOR YOU (EASIEST)</h3>
                  <p className="text-sm text-neutral-200">
                    If you share a temporary <strong>GitHub Personal Access Token (PAT)</strong> with <code>repo</code> permissions in our chat, I can run the push command for you immediately:
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Generate one in 30 seconds at: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="text-lime-400 underline">github.com/settings/tokens/new</a> (check <code>repo</code> scope) and paste it into chat.
                  </p>
                </div>

                <div className="my-5 p-4 bg-neutral-900 border border-neutral-700 rounded">
                  <h3 className="!mt-0 text-sky-400 font-bold">METHOD 2: DOWNLOAD ZIP & DRAG-AND-DROP</h3>
                  <p className="text-sm text-neutral-300">
                    Download the pre-packaged zip of this complete project and upload it directly on GitHub's website:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href="/sahil.page.gd.zip"
                      download="sahil.page.gd.zip"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 text-neutral-950 font-mono text-xs font-bold hover:bg-lime-300"
                    >
                      <Download className="w-4 h-4" /> DOWNLOAD sahil.page.gd.zip
                    </a>
                    <a
                      href="https://github.com/Sahil9599/sahil.page.gd/upload/main"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 border border-neutral-600 font-mono text-xs hover:border-lime-400"
                    >
                      <ExternalLink className="w-4 h-4" /> UPLOAD ON GITHUB WEB ↗
                    </a>
                  </div>
                </div>

                <div className="my-5 p-4 bg-neutral-900 border border-neutral-700 rounded">
                  <h3 className="!mt-0 text-sky-400 font-bold">METHOD 3: PUSH VIA YOUR TERMINAL</h3>
                  <p className="text-sm text-neutral-300">
                    Run these commands in your local computer's terminal:
                  </p>
                  <div className="bg-black/80 border border-neutral-700 p-3 rounded font-mono text-xs text-lime-400 mt-2 relative">
                    <pre className="overflow-x-auto whitespace-pre">
{`git remote add origin https://github.com/Sahil9599/sahil.page.gd.git
git branch -M main
git push -u origin main`}
                    </pre>
                    <button
                      type="button"
                      onClick={copyGitCommands}
                      className="absolute top-2 right-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded border border-neutral-600 flex items-center gap-1 text-[11px]"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCmd ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <h3>GITHUB PAGES SETTING:</h3>
                <p className="text-xs text-neutral-400">
                  After uploading, go to <strong>Settings → Pages</strong> in your repository, set branch to <code>main</code>, and your website will be live at <strong>sahil.page.gd</strong>!
                </p>
              </div>
            )}

            {/* Project Details Modal */}
            {activeModal.type === 'project' && activeModal.data && (
              <div className="modal-inner">
                <span>{activeModal.data.tag}</span>
                <h2>{activeModal.data.title}</h2>

                {'objective' in activeModal.data && (
                  <>
                    <h3>OBJECTIVE</h3>
                    <p>{activeModal.data.objective}</p>

                    <h3>TOOLS</h3>
                    <p>{activeModal.data.tools}</p>

                    <h3>LAB SETUP</h3>
                    <p>{activeModal.data.setup}</p>

                    <h3>WHAT I LEARNED</h3>
                    <p>{activeModal.data.learned}</p>

                    <a
                      href={activeModal.data.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View GitHub Repository (sahil.page.gd) ↗
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Post Details Modal */}
            {activeModal.type === 'post' && activeModal.data && (
              <div className="modal-inner">
                <span>{activeModal.data.tag}</span>
                <h2>{activeModal.data.title}</h2>
                <p>{'text' in activeModal.data ? activeModal.data.text : ''}</p>

                <h3>ETHICS NOTE</h3>
                <p>
                  All learning, network recon, and vulnerability verification should strictly take place on systems you own or have verified, written authorization to assess.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
