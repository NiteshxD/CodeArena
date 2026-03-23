import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Fix hook issue, redefining properly
  const [inputs, setInputs] = useState({ roomId: '', username: '' });

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

    // navigate
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-box">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-500 p-2 rounded-lg text-white">
            <Terminal size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CodeCollab
          </h1>
        </div>
        <h2 className="text-lg font-medium text-slate-300 mb-6">Enter Room Details to Join</h2>

        <form onSubmit={joinRoom} className="space-y-4">
          <div>
            <input 
              type="text" 
              className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
              placeholder="ROOM ID" 
              value={inputs.roomId}
              onChange={(e) => setInputs({ ...inputs, roomId: e.target.value })}
              onKeyUp={handleInputEnter}
            />
          </div>
          <div>
            <input 
              type="text" 
              className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="USERNAME" 
              value={inputs.username}
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              onKeyUp={handleInputEnter}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-brand-500 hover:bg-brand-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-brand-500/30"
            type="submit"
          >
            Join Room
          </motion.button>
        </form>

        <div className="mt-6 text-center text-slate-400">
          <span className="text-sm">If you don't have an invite code, create one:</span>
          <br/>
          <button 
            onClick={createNewRoom}
            className="mt-2 text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4 decoration-brand-500/50 hover:decoration-brand-400 transition-all"
          >
            Create New Room
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
