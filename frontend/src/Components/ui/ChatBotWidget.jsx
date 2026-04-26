import { useState, useRef, useEffect } from 'react';
import '../../styles/ChatBotWidget.css';

const QUICK_ACTIONS = ['Healthy Food', 'Budget Food', 'Fast Food'];

const initialMessage = {
  id: 'bot-welcome',
  sender: 'bot',
  text: 'Hi! I am your food assistant. Ask me for healthy meals, budget options, fast food, or items like rice, kottu, and pizza.',
};

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const appendMessage = (sender, text) => {
    const id = `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setMessages((prev) => [...prev, { id, sender, text }]);
  };

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || sending) return;

    appendMessage('user', text);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || 'Chat service is not available right now');
      }

      appendMessage('bot', json?.data?.reply || 'No response available right now.');
    } catch (error) {
      appendMessage('bot', 'Could not reach chatbot right now. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chatbot-widget-container">
      {isOpen && (
        <div className="chatbot-widget-window">
          <header className="chatbot-widget-header">
            <div>
              <h3>Food Assistant</h3>
              <p>Ask for suggestions!</p>
            </div>
            <button className="chatbot-widget-close" onClick={() => setIsOpen(false)} aria-label="Close Chat">
              ✕
            </button>
          </header>

          <div className="chatbot-widget-quick-actions">
            {QUICK_ACTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => sendMessage(label)}
                disabled={sending}
              >
                {label}
              </button>
            ))}
          </div>

          <section className="chatbot-widget-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-widget-row ${message.sender === 'user' ? 'chat-widget-row-user' : 'chat-widget-row-bot'}`}
              >
                <div className={`chat-widget-bubble ${message.sender === 'user' ? 'chat-widget-bubble-user' : 'chat-widget-bubble-bot'}`}>
                  {message.sender === 'bot' && message.text.includes('\n') ? (
                    <>
                      {message.text.split('\n').map((line, index) => (
                        <p
                          key={`${message.id}-${index}`}
                          className={line.startsWith('- ') ? 'chat-widget-highlight-line' : ''}
                        >
                          {line}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </section>

          <form className="chatbot-widget-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          className="chatbot-widget-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open Food Assistant Chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
