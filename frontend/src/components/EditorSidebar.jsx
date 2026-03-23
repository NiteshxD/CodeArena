import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogOut, MessageSquare, Send, PenTool } from 'lucide-react';

const EditorSidebar = ({ clients = [], roomId, onLeave, socket, username, onToggleWhiteboard, isWhiteboardActive }) => {
  const [activeTab, setActiveTab] = useState('users'); // users | chat
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('receive-message');
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    // Optimistic UI update
    const newMsg = { id: Date.now(), text: inputMsg, username, timestamp: new Date().toISOString(), isMe: true };
    setMessages((prev) => [...prev, newMsg]);
    
    socket.emit('chat-message', { roomId, message: inputMsg, username });
    setInputMsg('');
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 border-r border-slate-700/50">
      <div className="p-4 border-b border-slate-700/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400 drop-shadow-sm">CodeCollab</h2>
          <button 
            onClick={onToggleWhiteboard} 
            className={`p-1.5 rounded-md transition-colors ${isWhiteboardActive ? 'bg-brand-500 text-white' : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-dark-700'}`}
            title="Toggle Whiteboard"
          >
            <PenTool size={18} />
          </button>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-dark-800 p-2 rounded truncate border border-slate-700/50">Room: {roomId}</div>
      </div>

      <div className="flex border-b border-slate-700/50 mt-2">
        <button 
          className={`flex-1 flex justify-center py-3 border-b-2 text-sm font-medium transition-colors ${activeTab === 'users' ? 'border-brand-500 text-brand-400 bg-dark-800/50' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-800/30'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} className="mr-2" />
          Users
        </button>
        <button 
          className={`flex-1 flex justify-center py-3 border-b-2 text-sm font-medium transition-colors ${activeTab === 'chat' ? 'border-brand-500 text-brand-400 bg-dark-800/50' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-800/30'}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={18} className="mr-2" />
          Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-2">Connected ({clients.length})</h3>
              {clients.map((client, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={client.socketId} 
                  className="flex items-center space-x-3 bg-dark-800/50 p-2 rounded-lg border border-slate-700/50 hover:bg-dark-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg">
                    {client.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{client.username} {client.username === username && <span className="text-slate-500 text-xs ml-1">(You)</span>}</span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 mb-4 h-[calc(100vh-320px)]">
                {messages.length === 0 ? (
                  <div className="text-slate-500 text-center text-sm mt-10">No messages yet.</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isMe || msg.username === username ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-500 mb-1">{msg.username}</span>
                      <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${msg.isMe || msg.username === username ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-dark-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={sendMessage} className="mt-auto relative">
                <input 
                  type="text" 
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="w-full bg-dark-800 border-none rounded-lg pl-3 pr-10 py-2.5 text-sm focus:ring-1 focus:ring-brand-500 transition-all font-sans outline-none" 
                  placeholder="Type a message..."
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-300 transition-colors p-1">
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-700/50 bg-dark-800/30">
        <button 
          className="w-full flex items-center justify-center bg-dark-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 font-medium py-2.5 px-4 rounded-lg transition-all"
          onClick={onLeave}
        >
          <LogOut size={16} className="mr-2" />
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;
