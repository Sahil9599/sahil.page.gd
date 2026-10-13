# sahil.page.gd — Cybersecurity Student Portfolio

Interactive Cybersecurity Portfolio & Lab Terminal for **Zarki (Sahil)**.

Live Domain: [https://sahil.page.gd](https://sahil.page.gd)  
GitHub Profile: [https://github.com/zarki201432](https://github.com/zarki201432)  
Contact: [zarki201432@gmail.com](mailto:zarki201432@gmail.com)

---

## 🚀 How to Upload & Deploy to GitHub (`sahil.page.gd`)

### 1. Create the GitHub Repository
1. Visit [github.com/new](https://github.com/new)
2. Set the repository name to: **`sahil.page.gd`**
3. Choose **Public** and create without adding default README.

### 2. Push Code to GitHub
Open your terminal in this project root and run:

```bash
git init
git add .
git commit -m "Deploy sahil.page.gd portfolio"
git branch -M main
git remote add origin https://github.com/zarki201432/sahil.page.gd.git
git push -u origin main
```

*(If you have already added the remote, run `git push -u origin main`)*

---

### 3. Enable GitHub Pages & Custom Domain
1. In your GitHub repo, go to **Settings** > **Pages**.
2. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)` or GitHub Actions
3. Under **Custom domain**:
   - Enter: `sahil.page.gd`
   - Save and enable **Enforce HTTPS**.
4. In your DNS provider for `page.gd`, point your CNAME record:
   - Host: `sahil`
   - Value: `zarki201432.github.io`

---

## 🛠 Features
- **Interactive Security Lab Terminal**: Simulated CLI with command history (↑/↓), Tab auto-complete, clear, and themes (`help`, `ls`, `projects`, `skills`, `certifications`, `cat readme.md`, `nmap --help`, `repo`).
- **Terminal Theme Switcher**: Toggle between dark cyber terminal and light terminal modes (Hotkey: `t`).
- **Selected Security Work**:
  - `01 / Network Recon Lab` (Nmap, Wireshark, Linux)
  - `02 / Password Vault Audit` (OWASP ASVS, threat modeling)
  - `03 / Threat Detection Dashboard` (Python, Splunk, SIEM)
- **Security Journal & Lab Notes**: Writeups on Nmap scans, Wireshark packet analysis, and OWASP Top 10.
- **Real-Time IST Clock**: Live status indicator for India Standard Time.
- **Downloadable Résumé**: Direct link to download `zarki-resume.txt`.
- **Responsive Design**: Mobile drawer navigation and smooth interactive modal dialogs.
