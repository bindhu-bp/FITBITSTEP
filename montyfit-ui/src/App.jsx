import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("loginEmail");
    if (loggedInStatus === "true" && email) {
      setIsLoggedIn(true);
      setLoginEmail(email);
    }
  }, []);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setLoginEmail(email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginEmail", email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginEmail("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginEmail");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard email={loginEmail} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
