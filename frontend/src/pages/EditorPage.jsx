import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { initSocket } from '../socket';
import EditorSidebar from '../components/EditorSidebar';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import Whiteboard from '../components/Whiteboard';
import { Maximize2, Minimize2, X } from 'lucide-react';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardData, setWhiteboardData] = useState([]);
  const [editorWidth, setEditorWidth] = useState(70);
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let localSocket = null;

    const init = async () => {
      const socket = await initSocket();
      
      // Prevent StrictMode ghost sockets
      if (!isMounted) {
        socket.disconnect();
        return;
      }
      
      localSocket = socket;
      socketRef.current = socket;

      socket.on('connect_error', (err) => handleErrors(err));
      socket.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        if (!isMounted) return;
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      socket.emit('join-room', {
        roomId,
        username: location.state?.username,
      });

      // Listen for room state when joined
      socket.on('room-state', ({ code, language, users, whiteboard }) => {
        if (!isMounted) return;
        setClients(users);
        if (code !== null && code !== undefined) {
          codeRef.current = code;
        }
        setLanguage(language);
        if (whiteboard) {
          setWhiteboardData(whiteboard);
        }
      });

      // Listen for joining
      socket.on('user-joined', ({ message, users }) => {
        if (!isMounted) return;
        toast.success(message);
        setClients(users);
      });

      // Listen for leaving
      socket.on('user-left', ({ message, users }) => {
        if (!isMounted) return;
        toast.success(message);
        setClients(users);
      });
      
      // Listen for room full
      socket.on('room-full', () => {
        if (!isMounted) return;
        toast.error('Room is full (max 10 users)');
        reactNavigator('/');
      });
    };
    init();

    return () => {
      isMounted = false;
      if (localSocket) {
        localSocket.disconnect();
        localSocket.off('user-joined');
        localSocket.off('user-left');
        localSocket.off('room-state');
      } else if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off('user-joined');
        socketRef.current.off('user-left');
        socketRef.current.off('room-state');
      }
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const handleLeaveRoom = () => {
    reactNavigator('/');
  };

  const startResizing = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = editorWidth;
    
    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth + (deltaX / window.innerWidth) * 100;
      setEditorWidth(Math.max(20, Math.min(80, newWidth)));
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-900 text-white">
      {/* Sidebar - Accounts for clients */}
      <div className="w-64 flex flex-col bg-dark-800 border-r border-slate-700 h-full shadow-2xl z-10 flex-shrink-0">
        <EditorSidebar 
          clients={clients} 
          roomId={roomId} 
          onLeave={handleLeaveRoom} 
          socket={socketRef.current} 
          username={location.state?.username} 
          onToggleWhiteboard={() => {
            setShowWhiteboard(!showWhiteboard);
            if(isWhiteboardFullscreen) setIsWhiteboardFullscreen(false);
          }}
          isWhiteboardActive={showWhiteboard}
        />
      </div>

      {/* Main Workspace Area (Code + Whiteboard) */}
      <div className="flex-1 flex flex-row h-full overflow-hidden">
        
        {/* Editor Main Area */}
        <div 
          className={`flex flex-col h-full bg-[#1e1e2e] transition-none`}
          style={{ width: showWhiteboard && !isWhiteboardFullscreen ? `${editorWidth}%` : (isWhiteboardFullscreen ? '0%' : '100%'), display: isWhiteboardFullscreen ? 'none' : 'flex' }}
        >
          {/* Editor Wrapper */}
          <div className="flex-1 relative">
            <CodeEditor 
              socketRef={socketRef} 
              roomId={roomId} 
              onCodeChange={(code) => { codeRef.current = code; }} 
              language={language}
              username={location.state?.username}
            />
          </div>

          {/* Output Panel at the bottom */}
          <div className="h-64 border-t border-slate-700 bg-dark-900 z-10 flex-shrink-0 relative mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <OutputPanel codeRef={codeRef} language={language} setLanguage={(lang) => {
              setLanguage(lang);
              socketRef.current?.emit('language-update', { roomId, language: lang });
            }} socketRef={socketRef} roomId={roomId} />
          </div>
        </div>

        {/* Resizer Handle */}
        {showWhiteboard && !isWhiteboardFullscreen && (
          <div 
            className="w-1.5 hover:w-2 bg-slate-700 hover:bg-brand-500 cursor-col-resize transition-all z-20 flex items-center justify-center group"
            onMouseDown={startResizing}
          >
            <div className="h-8 w-1 bg-slate-500 group-hover:bg-white rounded-full"></div>
          </div>
        )}

        {/* Whiteboard Area */}
        {showWhiteboard && (
          <div 
            className="h-full bg-dark-800 relative transition-none"
            style={{ width: isWhiteboardFullscreen ? '100%' : `${100 - editorWidth}%` }}
          >
            {/* Whiteboard controls */}
            <div className="absolute top-4 right-4 z-[9999] flex gap-2">
              <button 
                onClick={() => setIsWhiteboardFullscreen(!isWhiteboardFullscreen)}
                className="p-2 bg-dark-800/80 hover:bg-dark-700 text-slate-300 hover:text-white rounded-md shadow backdrop-blur border border-slate-600 transition-colors"
                title="Toggle Fullscreen"
              >
                {isWhiteboardFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => {
                  setShowWhiteboard(false);
                  setIsWhiteboardFullscreen(false);
                }}
                className="p-2 bg-dark-800/80 hover:bg-red-500/80 text-slate-300 hover:text-white rounded-md shadow backdrop-blur border border-slate-600 transition-colors"
                title="Close Whiteboard"
              >
                <X size={18} />
              </button>
            </div>
            
            <Whiteboard socketRef={socketRef} roomId={roomId} initialData={whiteboardData} />
          </div>
        )}

      </div>
    </div>
  );
};

export default EditorPage;
