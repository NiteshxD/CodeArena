import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code2, Users, MessageSquare, Play, PenTool, ArrowRight, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  // State for login form
  const [inputs, setInputs] = useState({ roomId: '', username: '' });
  // State to toggle between Hero Landing and Join Form seamlessly
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Original Logic Preserved
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setInputs({ ...inputs, roomId: id });
    toast.success('Room created successfully!');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!inputs.roomId.trim() || !inputs.username.trim()) {
      toast.error('Room ID & Username are required!');
      return;
    }
    navigate(`/editor/${inputs.roomId}`, {
      state: { username: inputs.username }
    });
    toast.success('Joined Room!');
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom(e);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-brand-500/30 overflow-x-hidden">
      
      {/* Animated Deep Background Blurs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-2 rounded-lg text-white shadow-lg shadow-brand-500/30">
            <Terminal size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CodeCollab
          </span>
        </div>
        <button 
          onClick={() => setShowJoinForm(true)}
          className="px-6 py-2.5 rounded-full font-medium text-sm transition-all hover:bg-white/5 border border-white/10"
        >
          Login / Join
        </button>
      </nav>

      {/* Main Hero Header / Modal Form Interface */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 min-h-[70vh] flex flex-col justify-center">
        <div className="w-full max-w-4xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {!showJoinForm ? (
              <motion.div
                key="landing-hero"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-brand-300 mb-8"
                >
                  <Zap size={16} className="text-brand-400 drop-shadow-sm" />
                  <span>The ultimate tool for pair programming</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-lg"
                >
                  Code Together.<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">
                    Build Faster.
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                  Collaborate in real-time with developers anywhere in the world. Write, compile, and draw system architectures together with zero latency.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <button 
                    onClick={() => setShowJoinForm(true)}
                    className="group relative px-8 py-4 bg-brand-500 rounded-xl font-bold text-white overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-opacity opacity-0 group-hover:opacity-100" />
                    <span className="relative flex items-center gap-2">
                      Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-slate-300 hover:text-white transition-colors hover:bg-white/5">
                    View Features
                  </a>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="join-form"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto"
              >
                <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl border border-slate-700/50 text-left bg-dark-800/80">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>
                  
                  <button onClick={() => setShowJoinForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <span className="text-xs font-mono uppercase tracking-wider border border-slate-700 bg-dark-900 rounded px-2 py-1">Back</span>
                  </button>

                  <div className="mb-8 mt-2">
                    <h2 className="text-2xl font-bold mb-2">Join Workspace</h2>
                    <p className="text-slate-400 text-sm">Enter a room ID to collaborate with your team, or generate a fresh workspace.</p>
                  </div>

                  <form onSubmit={joinRoom} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">ROOM ID</label>
                      <input 
                        type="text" 
                        className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono shadow-inner"
                        placeholder="e.g. 550e8400-e29b-41d4-a716" 
                        value={inputs.roomId}
                        onChange={(e) => setInputs({ ...inputs, roomId: e.target.value })}
                        onKeyUp={handleInputEnter}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">USERNAME</label>
                      <input 
                        type="text" 
                        className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                        placeholder="Enter your display name" 
                        value={inputs.username}
                        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                        onKeyUp={handleInputEnter}
                      />
                    </div>
                    <button 
                      className="w-full bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 mt-2"
                      type="submit"
                    >
                      Join Room
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 text-sm mb-3">Starting a new project?</p>
                    <button 
                      onClick={createNewRoom}
                      className="text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center justify-center gap-2 mx-auto decoration-brand-500/30 hover:underline underline-offset-4"
                    >
                      <span>Create New Room</span> <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 py-24 bg-dark-800/40 border-y border-slate-800 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to build faster</h2>
            <p className="text-slate-400 text-lg">A complete toolchain designed specifically for team collaboration, mentoring, and dynamic technical interviews.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
             <FeatureCard 
               icon={<Code2 />}
               title="Real-time Code Sync"
               description="Write code together instantly. Editor changes broadcast dynamically to all connected clients with absolute zero latency."
             />
             <FeatureCard 
               icon={<Terminal />}
               title="Live Cursor Tracking"
               description="Watch where your teammates are looking. Every user gets a uniquely colored tracked cursor natively injected into the editor."
             />
             <FeatureCard 
               icon={<MessageSquare />}
               title="Built-in Chat System"
               description="Discuss implementations via an elegantly integrated real-time chat window sitting cleanly alongside your IDE."
             />
             <FeatureCard 
               icon={<Play />}
               title="Code Execution"
               description="Instantly compile and run your JavaScript, Python, or C++ directly from the application. Outputs sync to everyone simultaneously."
             />
             <FeatureCard 
               icon={<PenTool />}
               title="Collaborative Whiteboard"
               description="A seamlessly built-in Excalidraw instance allows you to sketch logic flowcharts and map architectures together."
             />
             <FeatureCard 
               icon={<Users />}
               title="Secure Transient Rooms"
               description="Each environment is isolated via cryptic UUIDs. Nothing is tracked, ensuring your pair-programming sessions stay highly private."
             />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
              <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                CodeCollab completely eliminates the setup friction typically required for pair programming. Drop directly into an optimized IDE environment in seconds.
              </p>
              
              <div className="space-y-8">
                <Step number="1" title="Create or Join a Room" description="Generate a secure room UUID instantly with one click, or paste an existing link provided by your teammate." />
                <Step number="2" title="Share the Room ID" description="Send the Room ID out so other developers can instantly jump directly into your live workspace." />
                <Step number="3" title="Start Coding Together" description="Watch cursors fly dynamically across your screen as you build, discuss, and compile software simultaneously." />
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="glass-panel p-2 rounded-2xl border border-slate-700/50 shadow-2xl relative bg-dark-800/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-purple-500/20 rounded-2xl blur-2xl -z-10" />
                <div className="bg-[#1e1e2e] rounded-xl overflow-hidden aspect-video border border-slate-800/80 flex flex-col shadow-inner">
                  
                  {/* Fake Editor Header */}
                  <div className="h-10 bg-[#181825] flex items-center px-4 gap-2 border-b border-black/20">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 px-3 py-1 bg-dark-800 rounded-md text-[10px] text-slate-400 font-mono border border-slate-700">server.js</div>
                  </div>
                  
                  {/* Fake Editor Body */}
                  <div className="flex-1 p-6 font-mono text-sm sm:text-base opacity-90 space-y-2 relative">
                    <p><span className="text-purple-400">async function</span> <span className="text-blue-400">initializeCollab</span>() {'{'}</p>
                    <p className="pl-6"><span className="text-purple-400">const</span> <span className="text-white">room</span> <span className="text-purple-400">=</span> <span className="text-purple-400">await</span> <span className="text-white">Workspace.</span><span className="text-blue-400">join</span>();</p>
                    <p className="pl-6"><span className="text-white">room.</span><span className="text-blue-400">sync</span>(<span className="text-green-300">"real-time"</span>);</p>
                    <p>{'}'}</p>
                    
                    {/* Fake Animated Cursor */}
                    <motion.div 
                      animate={{ x: [0, 80, 20, 140, 0], y: [0, 25, -5, 50, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-14 left-[20%] w-[2px] h-5 bg-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    >
                      <div className="absolute top-full left-0 bg-brand-400 text-white text-[10px] font-sans px-1.5 py-0.5 rounded-sm whitespace-nowrap mt-1 font-bold z-10 shadow-lg">Nitesh</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-24 bg-dark-800/30 border-t border-slate-800/80">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-block p-4 rounded-3xl bg-brand-500/10 text-brand-400 mb-6 border border-brand-500/20 shadow-inner">
            <Users size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About CodeCollab</h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            CodeCollab is a deeply integrated platform fusing the collaborative majesty of Google Docs with the raw, uncompromising power of tools like VS Code and Excalidraw. It beautifully bridges the gap between remote developers, facilitating live interaction that massively boosts productivity. Whether you're tackling complex system architectures during a live technical interview, mentoring junior developers, or hacking through a weekend project, CodeCollab provides the unified digital desk your team requires.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-slate-800 bg-dark-900 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-slate-400" />
          <span className="font-semibold text-slate-300">CodeCollab</span>
        </div>
        <p className="text-sm">Built with the MERN Stack. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// Layout Utility Components
const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl bg-dark-800/60 border border-slate-700/50 hover:border-brand-500/40 transition-all backdrop-blur-md shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] group"
  >
    <div className="w-14 h-14 rounded-xl bg-dark-900 border border-slate-700/50 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-5">
    <div className="w-12 h-12 shrink-0 rounded-2xl bg-dark-800 border-2 border-brand-500/30 text-brand-400 flex items-center justify-center text-lg font-bold font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)]">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2 text-slate-200">{title}</h3>
      <p className="text-slate-400 leading-relaxed max-w-md text-sm">{description}</p>
    </div>
  </div>
);

export default Home;
