import React, { useRef, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { updateMainCode, updateScratchpadCode } from '../../store/roomSlice';

const EditorComponent = ({ socket, roomId, isDriver, isScratchpad, overrideCode, targetSocketId, onCodeChange, onRunCode, onSelectionChange }) => {
  const monacoRef = useRef(null);
  const dispatch = useDispatch();
  const mainCode = useSelector(state => state.room.mainCode);
  const selectedLanguage = useSelector(state => state.execution.language);

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = editor;

    // Ctrl+Enter → Run Code shortcut
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        if (onRunCode) onRunCode();
      }
    });

    // Track selection changes for block commenting
    if (onSelectionChange) {
      editor.onDidChangeCursorSelection((e) => {
        const sel = e.selection;
        if (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn) {
          onSelectionChange({
            lineStart: sel.startLineNumber,
            lineEnd: sel.endLineNumber
          });
        }
      });
    }
  };

  const handleEditorChange = (value) => {
    if (onCodeChange) {
      onCodeChange(value);
      return;
    }

    if (isScratchpad) {
      dispatch(updateScratchpadCode({ username: targetSocketId, delta: value }));
      if (socket) socket.emit('scratchpad:delta', { roomId, delta: value });
    } else {
      dispatch(updateMainCode(value));
      if (socket && isDriver) socket.emit('code:delta', { roomId, delta: value });
    }
  };

  const value = isScratchpad ? overrideCode : mainCode;

  const getMonacoLanguage = (lang) => {
    if (lang === 'cpp' || lang === 'c') return 'cpp';
    return lang;
  };

  return (
    <MonacoEditor
      height="100%"
      language={getMonacoLanguage(selectedLanguage)}
      theme="vs-dark"
      value={value}
      options={{
        readOnly: !isDriver,
        minimap: { enabled: !isScratchpad },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 8 },
      }}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
    />
  );
};

export default EditorComponent;
