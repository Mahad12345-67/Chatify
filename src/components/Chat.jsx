import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const sanitizeMessageContent = (content) => {
  const tempElement = document.createElement('div');
  tempElement.innerText = content;
  return tempElement.innerHTML;
};

const ChatApp = ({ token }) => {
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('messages')) || []);
  const [inputText, setInputText] = useState('');
  const [currentChat, setCurrentChat] = useState(localStorage.getItem('currentChatId') || '');
  const [username] = useState(localStorage.getItem('username') || 'Användare');
  const [userId] = useState(localStorage.getItem('userId') || '');
  const [chatList, setChatList] = useState(JSON.parse(localStorage.getItem('chatList')) || []);
  const botAvatar = '/chatbot-avatar.png.png';

  const getRelevantResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hur mår du')) {
      return 'Jag mår bra, tack för att du frågar! Hur mår du?';
    }
    if (lowerCaseMessage.includes('hej')) {
      return 'Hej, jag är chatboten Antony. Vad vill du prata om idag?';
    }
    if (lowerCaseMessage.includes('väder')) {
      return 'Jag hoppas att vädret är fint där du är!';
    }
    if (lowerCaseMessage.includes('jobb') || lowerCaseMessage.includes('arbete')) {
      return 'Hur går det med jobbet? Har du några utmaningar?';
    }
    if (lowerCaseMessage.includes('hjälp')) {
      return 'Vad behöver du hjälp med? Jag ska försöka mitt bästa!';
    }
    if (lowerCaseMessage.includes('tack')) {
      return 'Varsågod! Jag är glad att jag kunde hjälpa.';
    }

    return 'Det där lät intressant, kan du berätta mer?';
  };

  useEffect(() => {
    if (!currentChat) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`https://chatify-api.up.railway.app/messages?conversationId=${currentChat}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Kunde inte hämta meddelanden');

        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
        localStorage.setItem('messages', JSON.stringify(fetchedMessages));

        const isChatExist = chatList.some((chat) => chat.id === currentChat);
        if (!isChatExist) {
          const newChat = { id: currentChat, name: 'Ny Konversation' };
          const updatedChatList = [...chatList, newChat];
          setChatList(updatedChatList);
          localStorage.setItem('chatList', JSON.stringify(updatedChatList));
        }
      } catch (error) {
        console.error('Kunde inte hämta meddelanden');
      }
    };

    loadMessages();
  }, [currentChat, token, chatList]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizeMessageContent(inputText),
          conversationId: currentChat,
        }),
      });

      if (!response.ok) throw new Error('Meddelandet kunde inte skickas');

      const { latestMessage } = await response.json();
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { ...latestMessage, userId, username }];
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      setInputText('');

      setTimeout(() => {
        const fakeResponse = {
          id: Math.random().toString(36).substr(2, 9),
          text: getRelevantResponse(inputText),
          conversationId: currentChat,
          userId: 'bot123',
          username: 'ChatBot',
          avatar: botAvatar,
        };

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, fakeResponse];
          localStorage.setItem('messages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }, 500);

    } catch (error) {
      console.error('Meddelandet kunde inte skickas');
    }
  };

  const removeMessagePair = (messageId) => {
    setMessages((prevMessages) => {
      const messageIndex = prevMessages.findIndex((message) => message.id === messageId);
      if (messageIndex === -1) return prevMessages;

      const isUserMessage = prevMessages[messageIndex].userId?.toString() === userId?.toString();
      const isBotResponse = prevMessages[messageIndex + 1]?.userId === 'bot123';

      if (isUserMessage && isBotResponse) {
        const updatedMessages = prevMessages.filter((_, index) => index !== messageIndex && index !== messageIndex + 1);
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        return updatedMessages;
      }

      return prevMessages;
    });
  };

  const removeAllChats = () => {
    setMessages([]);
    setChatList([]);
    localStorage.removeItem('messages');
    localStorage.removeItem('chatList');
    localStorage.removeItem('currentChatId');
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="chat-container border rounded p-4 bg-white w-75">
        <div className="chat-header mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
          <h2 className="chat-title">Chatt: {chatList.find((chat) => chat.id === currentChat)?.name || ''}</h2>
          <button onClick={removeAllChats} className="btn btn-sm btn-danger">Rensa alla chattar</button>
        </div>
        <div className="chat-list mb-3">
          {chatList.map((chat) => (
            <button key={chat.id} onClick={() => setCurrentChat(chat.id)} className="btn btn-outline-primary btn-sm me-2">
              {chat.name}
            </button>
          ))}
        </div>
        <div className="chat-messages mb-3 overflow-auto" style={{ maxHeight: '50vh' }}>
          {messages.map((message) => (
            <div key={message.id} className={`d-flex mb-2 ${message.userId?.toString() === userId?.toString() ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className="d-flex align-items-start">
                <img
                  src={message.userId?.toString() === userId?.toString() ? `https://i.pravatar.cc/100?u=${message.userId}` : botAvatar}
                  alt="avatar"
                  className="rounded-circle me-2"
                  style={{ width: '40px', height: '40px' }}
                />
                <div className="chat-bubble bg-light border rounded p-2">
                  <div className="fw-bold small mb-1">{message.username}</div>
                  <p className="mb-1 small" dangerouslySetInnerHTML={{ __html: sanitizeMessageContent(message.text) }}></p>
                  {message.userId?.toString() === userId?.toString() && (
                    <button onClick={() => removeMessagePair(message.id)} className="btn btn-sm btn-danger">Ta bort</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input d-flex mt-3">
          <input
            id="chatInput"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Skriv ett meddelande..."
            className="form-control me-2"
          />
          <button onClick={sendMessage} className="btn btn-primary">Skicka</button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;