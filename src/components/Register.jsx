import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

const Register = ({ csrfToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch("https://chatify-api.up.railway.app/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ username, password, email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Username or email already exists");
        }

        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        navigate("/login", { state: { message: "Registration successful" } });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center">
      <div className="bg-white bg-opacity-60 backdrop-blur-lg p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-light text-center mb-8 text-white tracking-wide">
          REGISTER
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <p className="text-green-500 text-center mb-4">
          Already have an account?{" "}
          <NavLink to="/login" className="text-blue-500 underline">
            Login
          </NavLink>
        </p>

        {isLoading ? (
          <p className="text-center text-white">Registering...</p>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
