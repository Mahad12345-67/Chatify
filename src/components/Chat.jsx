import React, { useState, useEffect } from 'react';

const sanitizeMessageContent = (content) => {
  const tempElement = document.createElement('div');
  tempElement.innerText = content;
  return tempElement.innerHTML;
};

const Chat = ({ token }) => {
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('chatMessages')) || []);
  const [inputMessage, setInputMessage] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [currentConversation, setCurrentConversation] = useState(localStorage.getItem('currentConversationId') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUsername') || '');
  const [currentUserId] = useState(localStorage.getItem('currentUserId') || '');
  const [allConversations, setAllConversations] = useState(JSON.parse(localStorage.getItem('allConversations')) || []);

  const fakeResponses = [
    "Det här är ett automatiskt svar!",
    "Intressant fråga, berätta mer!",
    "Jag håller med!",
    "Vad tycker du om vädret idag?",
    "Det låter spännande!",
    "Tack för ditt meddelande!",
    "Jag funderar också på det...",
    "Kul att höra från dig!",
    "Ska vi prata om något annat?",
    "Har du några andra tankar?"
  ];

  const getRandomResponse = () => {
    return fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
  };

  useEffect(() => {
    if (!currentConversation) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`https://chatify-api.up.railway.app/messages?conversationId=${currentConversation}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Kunde inte hämta meddelanden');

        const fetchedMessages = await response.json();
        setChatMessages(fetchedMessages);
        localStorage.setItem('chatMessages', JSON.stringify(fetchedMessages));

        const isConversationExist = allConversations.some((conversation) => conversation.id === currentConversation);
        if (!isConversationExist) {
          const newConversation = {
            id: currentConversation,
            name: 'Ny konversation',
          };
          const updatedConversations = [...allConversations, newConversation];
          setAllConversations(updatedConversations);
          localStorage.setItem('allConversations', JSON.stringify(updatedConversations));
        }
      } catch (error) {
        setFetchError('Kunde inte hämta meddelanden');
      }
    };

    loadMessages();
  }, [currentConversation, token, allConversations]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizeMessageContent(inputMessage),
          conversationId: currentConversation,
        }),
      });

      if (!response.ok) throw new Error('Meddelandet kunde inte skickas');

      const { latestMessage } = await response.json();
      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { ...latestMessage, userId: currentUserId, username: currentUser }];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      setInputMessage('');

      setTimeout(() => {
        const fakeResponse = {
          id: Math.random().toString(36).substr(2, 9),
          text: getRandomResponse(),
          conversationId: currentConversation,
          userId: 'bot123',
          username: 'ChatBot',
          avatar: 'https://i.pravatar.cc/100?u=bot123',
        };

        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, fakeResponse];
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }, 2000); 

    } catch (error) {
      setFetchError('Meddelandet kunde inte skickas');
    }
  };

  const removeMessage = async (messageId) => {
    try {
      const response = await fetch(`https://chatify-api.up.railway.app/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Meddelandet kunde inte raderas');

      setChatMessages((previousMessages) => {
        const updatedMessages = previousMessages.filter((message) => message.id !== messageId);
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    } catch (error) {
      setFetchError('Meddelandet kunde inte raderas');
    }
  };

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation.id);
    localStorage.setItem('currentConversationId', conversation.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="chat-container">
        <div className="chat-header">
          <h2 className="chat-title">
            Chatt: {allConversations.find((convo) => convo.id === currentConversation)?.name || ''}
          </h2>
        </div>
        <div className="chat-messages">
          <div className="message-list">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.userId?.toString() === currentUserId?.toString() ? 'sent' : 'received'}`}
              >
                <div className="message-avatar">
                  <img src={message.avatar || 'https://i.pravatar.cc/100'} alt="avatar" />
                </div>
                <div className="message-content">
                  <div className="message-username">{message.username}</div>
                  <p className="message-text" dangerouslySetInnerHTML={{ __html: sanitizeMessageContent(message.text) }}></p>
                  {message.userId?.toString() === currentUserId?.toString() && (
                    <button
                      onClick={() => removeMessage(message.id)}
                      className="remove-message-btn"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-input-container">
          <input
            id="inputMessage"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Skriv ditt meddelande..."
            className="input-message"
          />
          <button
            onClick={sendMessage}
            className="send-button"
          >
            ✉
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
