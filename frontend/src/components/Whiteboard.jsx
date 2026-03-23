import React, { useState, useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

const Whiteboard = ({ socketRef, roomId, initialData }) => {
  const excalidrawAPI = useRef(null);
  const isRemoteUpdate = useRef(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (initialData && initialData.length > 0 && excalidrawAPI.current) {
      excalidrawAPI.current.updateScene({ elements: initialData });
    }
  }, [initialData]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !socket.connected) return;

    const handleWhiteboardUpdate = (elements) => {
      isRemoteUpdate.current = true;
      if (excalidrawAPI.current) {
        excalidrawAPI.current.updateScene({ elements });
      }
    };

    const handleWhiteboardClear = () => {
      isRemoteUpdate.current = true;
      if (excalidrawAPI.current) {
        excalidrawAPI.current.updateScene({ elements: [] });
      }
    };

    socket.on('whiteboard-update', handleWhiteboardUpdate);
    socket.on('whiteboard-clear', handleWhiteboardClear);

    return () => {
      socket.off('whiteboard-update', handleWhiteboardUpdate);
      socket.off('whiteboard-clear', handleWhiteboardClear);
    };
  }, [socketRef, roomId]);

  const onChange = (elements, appState, files) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('whiteboard-update', { roomId, elements });
      }
    }, 100);
  };

  return (
    <div style={{ height: "100%", width: "100%" }} className="relative bg-dark-900 border-none">
      <Excalidraw 
        excalidrawAPI={(api) => excalidrawAPI.current = api}
        onChange={onChange}
        theme="dark"
        initialData={{
          elements: initialData && initialData.length > 0 ? initialData : [],
          appState: { viewBackgroundColor: "#1e1e2e" }
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            saveToActiveFile: true,
            loadScene: false,
            export: { saveFileToDisk: true },
            toggleTheme: true
          }
        }}
      />
    </div>
  );
};

export default Whiteboard;
