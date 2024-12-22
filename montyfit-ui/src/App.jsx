// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import "./App.css";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Dashboard from "./components/Dashboard";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loginEmail, setLoginEmail] = useState("");
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const loggedInStatus = localStorage.getItem("isLoggedIn");
//     const email = localStorage.getItem("loginEmail");
//     const storedUserId = localStorage.getItem("userId"); // Retrieve userId from localStorage

//     if (loggedInStatus === "true" && email && storedUserId) {
//       setIsLoggedIn(true);
//       setLoginEmail(email);
//       setUserId(storedUserId); // Set userId state
//     }
//   }, []);

//   const handleLogin = (email, userId) => {
//     setIsLoggedIn(true);
//     setLoginEmail(email);
//     setUserId(userId); // Store the user_id as well
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("loginEmail", email);
//     localStorage.setItem("userId", userId); // Store user_id in localStorage if necessary
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setLoginEmail("");
//     setUserId(null); // Clear userId on logout
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("loginEmail");
//     localStorage.removeItem("userId");
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             isLoggedIn ? (
//               <Dashboard
//                 email={loginEmail}
//                 userId={userId}
//                 onLogout={handleLogout}
//               />
//             ) : (
//               <Login onLogin={handleLogin} />
//             )
//           }
//         />
//         <Route path="/signup" element={<Signup />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import Toaster
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import toast from "react-hot-toast"; // Import toast

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("loginEmail");
    const storedUserId = localStorage.getItem("userId"); // Retrieve userId from localStorage

    if (loggedInStatus === "true" && email && storedUserId) {
      setIsLoggedIn(true);
      setLoginEmail(email);
      setUserId(storedUserId); // Set userId state
    }
  }, []);

  const handleLogin = (email, userId) => {
    setIsLoggedIn(true);
    setLoginEmail(email);
    setUserId(userId); // Store the user_id as well
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginEmail", email);
    localStorage.setItem("userId", userId); // Store user_id in localStorage if necessary
    toast.success("Login Successful!"); // Show success toast on successful login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginEmail("");
    setUserId(null); // Clear userId on logout
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully!"); // Show success toast on logout
  };

  return (
    <Router>
      {/* Toaster is placed here to show global toasts */}
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard
                email={loginEmail}
                userId={userId}
                onLogout={handleLogout}
              />
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
