import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; 

const ChatModal = ({ isOpen, onClose, onSendMessage, conversation, isLoading, initialMessage }) => {
  const [message, setMessage] = useState('');
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage || '');
    }
  }, [isOpen, initialMessage]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h3>FlowStack Chat</h3>
          <button onClick={onClose} style={styles.closeButton}>X</button>
        </div>

        <div ref={chatBodyRef} style={styles.chatBody}>
          {/* --- Empty State Message --- */}
          {conversation.length === 0 && !isLoading && (
            <div style={styles.emptyState}>Start a conversation to test your stack</div>
          )}

          {conversation.map((msg, index) => (
            <div key={index} style={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}>
              {/* --- Use ReactMarkdown for AI messages --- */}
              {msg.sender === 'ai' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          ))}

          {/* --- "Thinking..." Indicator --- */}
          {isLoading && (
            <div style={styles.aiMessage}>Thinking...</div>
          )}
        </div>

        <div style={styles.chatInputContainer}>
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            style={styles.chatInput}
            placeholder="Send a message"
            disabled={isLoading}
          />
          <button onClick={handleSend} style={styles.sendButton} disabled={isLoading}>Send</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { width: '600px', height: '70vh', backgroundColor: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    header: { padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeButton: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    emptyState: { margin: 'auto', color: '#999' },
    userMessage: { alignSelf: 'flex-end', background: '#e1f5fe', color: '#01579b', borderRadius: '12px 8px 12px 12px', padding: '8px 12px', marginBottom: '10px', maxWidth: '80%' },
    aiMessage: { alignSelf: 'flex-start', background: '#f1f1f1', color: '#333', borderRadius: '8px 12px 12px 12px', padding: '8px 12px', marginBottom: '10px', maxWidth: '80%' },
    chatInputContainer: { display: 'flex', padding: '10px', borderTop: '1px solid #eee', gap: '10px' },
    chatInput: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' },
    sendButton: { padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '14px' }
};

export default ChatModal;