import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SideNav({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setToken("");
    navigate("/login");
  };

  const isChatPage = location.pathname === "/chat";

  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
      {isChatPage && username && (
        <>
          <h1 className="text-start m-0">Välkommen {username}!</h1>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logga ut
          </button>
        </>
      )}
    </div>
  );
}

export default SideNav;
