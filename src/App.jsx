import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Login from './components/Login';
import Chat from './components/Chat';
import Register from './components/Register';

const ProtectedRoute = ({ element, token }) => {
  return token ? element : <Navigate to="/login" />;
};

const LoadingComponent = () => (
  <div className="loading">
    <p>Loading...</p>
  </div>
);

const ErrorComponent = ({ error }) => {
  if (!error) return null;
  return (
    <div className="error">
      <p>{error}</p>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [currentConversation, setCurrentConversation] = useState(
    localStorage.getItem('currentConversation') || ''
  );
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }, [token, userId]);

  useEffect(() => {
    localStorage.setItem('currentConversation', currentConversation);
  }, [currentConversation]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://chatify-api.up.railway.app/csrf', { method: 'PATCH' });
        if (!response.ok) throw new Error('Failed to fetch CSRF token');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCsrfToken();
  }, []);

  if (loading) return <LoadingComponent />;

  return (
    <div>
      <ErrorComponent error={error} />

      <Router>
        <SideNav token={token} setToken={setToken} userId={userId} />
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} />} />
          <Route path="/register" element={<Register csrfToken={csrfToken} />} />
          <Route
            path="/login"
            element={<Login setToken={setToken} setUserId={setUserId} csrfToken={csrfToken} />}
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute
                element={
                  <Chat
                    token={token}
                    userId={userId}
                    currentConversation={currentConversation}
                    setCurrentConversation={setCurrentConversation}
                  />
                }
                token={token}
              />
            }
          />
          <Route path="*" element={<Navigate to={token ? "/chat" : "/login"} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
