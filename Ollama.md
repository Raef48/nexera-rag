# Ollama Setup Guide

## macOS

**1. Install**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
Or download the app from [ollama.com/download](https://ollama.com/download) and drag to Applications.

**2. Pull Models**
```bash
ollama pull tinyllama
ollama pull nomic-embed-text
```

**3. Start Server**
```bash
ollama serve
```
Runs on `http://localhost:11434` — keep this terminal open.

---

## Windows

**1. Install**

Download the installer from [ollama.com/download](https://ollama.com/download) and run it.

**2. Pull Models**

Open Command Prompt or PowerShell:
```bash
ollama pull tinyllama
ollama pull nomic-embed-text
```

**3. Start Server**
```bash
ollama serve
```

> Ollama also auto-starts in the system tray after installation on Windows.

---

## Verify Installation

```bash
ollama list
```

You should see both models:

| Model | Size |
|---|---|
| `tinyllama` | ~637 MB |
| `nomic-embed-text` | ~274 MB |

---

## Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
