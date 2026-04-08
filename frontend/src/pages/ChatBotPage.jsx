import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ChatBotPage.css';

const QUICK_ACTIONS = ['Healthy Food', 'Budget Food', 'Fast Food'];

const initialMessage = {
  id: 'bot-welcome',
  sender: 'bot',
  text: 'Hi! I am your food assistant. Ask me for healthy meals, budget options, fast food, or items like rice, kottu, and pizza.',
};

export default function ChatBotPage() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

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
    <div className="chatbot-page">
      <header className="chatbot-header">
        <div>
          <h1>Food Recommendation Chatbot</h1>
          <p>Ask for healthy food, budget meals, or item-based suggestions.</p>
        </div>
        <Link to="/menu" className="chatbot-back-link">
          Back to Browse Menu
        </Link>
      </header>

      <div className="chatbot-quick-actions">
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

      <section className="chat-window" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-row ${message.sender === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
          >
            <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
              {message.sender === 'bot' && message.text.includes('\n') ? (
                <>
                  {message.text.split('\n').map((line, index) => (
                    <p
                      key={`${message.id}-${index}`}
                      className={line.startsWith('- ') ? 'chat-highlight-line' : ''}
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
      </section>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your food question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
