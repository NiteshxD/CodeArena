import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ socketRef, roomId, onCodeChange, language, username }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [decorations, setDecorations] = useState([]);

  // Setup initial themes and defaults
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Create custom theme mimicking modern VS Code dark
    monaco.editor.defineTheme('codeCollabTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '1e1e2e' }
      ],
      colors: {
        'editor.background': '#1e1e2e',
        'editorLineNumber.foreground': '#6272a4',
        'editor.selectionBackground': '#44475a',
        'editorCursor.foreground': '#f8f8f2'
      }
    });
    monaco.editor.setTheme('codeCollabTheme');

    // Setup format to listen to value changes locally
    editor.onDidChangeModelContent((event) => {
      const currentCode = editor.getValue();
      onCodeChange(currentCode);
      
      // Emit to server to broadcast, except when it's an incoming change
      // handled separately in useEffect
    });
    
    // Listen for cursor selection/move
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef && socketRef.current) {
         socketRef.current.emit('cursor-update', {
           roomId,
           cursor: { lineNumber: e.position.lineNumber, column: e.position.column },
           username
         });
      }
    });
  };

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !socket.connected) return;

    // Receive code change from other clients
    socket.on('code-change', (newCode) => {
      if (newCode !== null && editorRef.current) {
        const currentCode = editorRef.current.getValue();
        if (newCode !== currentCode) {
          // Saving current cursor positional state
          const position = editorRef.current.getPosition();
          
          editorRef.current.setValue(newCode);
          onCodeChange(newCode); // Update parent ref

          // Restore cursor
          if (position) {
             editorRef.current.setPosition(position);
          }
        }
      }
    });

    // Language listener setup from room state or sync
    socket.on('language-change', (newLang) => {
      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        monacoRef.current.editor.setModelLanguage(model, newLang);
      }
    });
    
    // Remote Cursor Tracker via Decorations
    socket.on('remote-cursor-update', ({ socketId, cursor, username: remoteUser }) => {
      if (editorRef.current && monacoRef.current) {
        // Find existing decoration for this socket to remove
        const newDecorations = [
          {
            range: new monacoRef.current.Range(cursor.lineNumber, cursor.column, cursor.lineNumber, cursor.column),
            options: {
              className: 'remote-cursor',
              hoverMessage: { value: remoteUser }
            }
          }
        ];
        // In Monaco, we need to pass old decoration IDs to deltaDecorations to update/remove them
        // For simplicity with multiple cursors without a map here, we just apply momentarily or clear prev
        setDecorations((prev) => editorRef.current.deltaDecorations(prev, newDecorations));
      }
    });

    return () => {
      socket.off('code-change');
      socket.off('language-change');
      socket.off('remote-cursor-update');
    };
  }, [socketRef.current, roomId]); // Dependency on the current value

  // Handle local typing to emit events
  const handleChange = (value) => {
    if (socketRef.current) {
      socketRef.current.emit('code-update', { roomId, code: value });
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={language}
        defaultValue="// Start typing here..."
        onMount={handleEditorDidMount}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontLigatures: true,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          wordWrap: "on",
          lineNumbersMinChars: 4,
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
      />
    </div>
  );
};

export default CodeEditor;
