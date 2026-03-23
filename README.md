<div align="center">
  <h1>🌐 CodeArena</h1>
  <p><strong>A Real-Time, Full-Stack Collaborative Code Editor & Whiteboard</strong></p>
</div>

---

## 📖 About
**CodeArena** is a production-grade collaborative workspace designed specifically for developers, educators, and teams. Imagine the seamless real-time syncing of Google Docs, fused with the power of VS Code and Excalidraw. 

Whether you are pair programming, conducting technical interviews, or teaching syntax, CodeArena provides a zero-latency, lag-free environment to type logic together, draw system architecture, and execute code live.

## ✨ Key Features
- **⚡ Live Code Synchronization:** See keystrokes instantly across all connected clients.
- **🖱️ Remote Cursor Tracking:** Know exactly where your teammates are looking with user-tagged custom cursors.
- **🚀 Live Code Execution:** Compile and run your JavaScript, Python, and C++ code directly within the browser natively.
- **🎨 Collaborative Whiteboard:** A toggleable, split-screen Excalidraw window strictly synchronized for drawing wireframes and flowcharts together.
- **💬 Real-Time Chat System:** Dedicated side-panel messaging for seamless room communication.
- **🌌 Premium UI/UX:** A stunning, dark-themed glassmorphic interface powered by Tailwind CSS and Framer Motion transitions.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Monaco Editor, Excalidraw
- **Backend:** Node.js, Express
- **Real-Time Engine:** Socket.io
- **Execution Engine:** Native `child_process` execution & Piston API 

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NiteshxD/CodeArena.git
   cd CodeArena
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Start the Frontend:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Start Coding:**
   Navigate to `http://localhost:5173`, create a new room, share the ID with your friends, and start collaborating!
