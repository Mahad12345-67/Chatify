import React from 'react';
import { useNavigate } from 'react-router-dom';

function SideNav({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken('');
    navigate('/login');
  };

  return (
    <div style={{
      width: '100%',
      height: '60px',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: '#f4f4f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default SideNav;
