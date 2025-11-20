import React, { useState, useRef, useEffect } from 'react';

export default function ChatBox({ style, userData }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'assistant', text: 'Hi — I can help you brainstorm. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const idRef = useRef(2);

  useEffect(() => {
    // scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function sendMessage() {
    const trimmed = (input || '').trim();
    if (!trimmed) return;
    const userMsg = { id: idRef.current++, sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Add a temporary assistant placeholder so the UI shows a typing state
    const placeholderId = idRef.current++;
    const placeholder = { id: placeholderId, sender: 'assistant', text: '...' };
    setMessages(prev => [...prev, placeholder]);

    // Call server-side proxy to Databricks
    (async () => {
      try {
        const resp = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, userData })
        });
        const data = await resp.json();
        const replyText = data?.reply || (data?.raw ? JSON.stringify(data.raw) : 'No reply');

        setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: replyText } : m));
      } catch (err) {
        setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: 'Error contacting assistant' } : m));
      }
    })();
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{
      borderRadius: 8,
      width: '90vw',
      height: '80vh',
      margin: '60px',
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      textAlign: 'left',
      ...style
    }}>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 6, background: 'transparent' }}>
          {messages.map(m => {
            const isAssistant = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                style={{
                  marginBottom: 8,
                  display: 'flex',
                  gap: 8,
                  justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                  alignItems: 'flex-start'
                }}
              >
                {isAssistant ? (
                  <>
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#374B47', marginTop: 8 }} />
                    <div style={{
                      background: 'rgba(255, 255 ,255,0.2)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      whiteSpace: 'pre-wrap',
                      maxWidth: '70%',
                      textAlign: 'left'
                    }}>{m.text}</div>
                  </>
                ) : (
                  <>
                    <div style={{
                      background: 'rgba(255, 255 ,255,0.2)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      whiteSpace: 'pre-wrap',
                      maxWidth: '70%',
                      textAlign: 'right'
                    }}>{m.text}</div>
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#b76b6b', marginTop: 8 }} />
                  </>
                )}
              </div>
            );
          })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Type a question and press Enter"
          style={{ flex: 1, resize: 'none', padding: 8, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)' }}
        />
        <button onClick={sendMessage} style={{ padding: '8px 12px', borderRadius: 6, background: '#715356', color: '#fff', border: 'none' }}>Send</button>
      </div>
    </div>
  );
}

async function sendMessage() {
  const trimmed = (input || '').trim();
  if (!trimmed) return;
  const userMsg = { id: idRef.current++, sender: 'user', text: trimmed };
  setMessages(prev => [...prev, userMsg]);
  setInput('');

  try {
    const resp = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed, conversation: [] })
    });
    const data = await resp.json();
    if (data?.reply) {
      setMessages(prev => [...prev, { id: idRef.current++, sender: 'assistant', text: data.reply }]);
    } else {
      setMessages(prev => [...prev, { id: idRef.current++, sender: 'assistant', text: 'Sorry, no reply.' }]);
    }
  } catch (e) {
    setMessages(prev => [...prev, { id: idRef.current++, sender: 'assistant', text: 'Error contacting assistant.' }]);
  }
}