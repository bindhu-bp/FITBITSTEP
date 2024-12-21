import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://jrl72ep0hb.execute-api.us-east-1.amazonaws.com/dev/login",
        {
          loginEmail,
          loginPassword,
        }
      );
      if (response.data.message === "valid") {
        // Call onLogin prop with loginEmail
        onLogin(loginEmail);
      } else if (response.data.message === "invalid") {
        setErrorMessage("Account does not exist. Click on Signup.");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-12 lg:px-8 mt-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-20 w-auto"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_e-XN_I7Jj-NiuE0t7a4TqvsZWqz8aRSkMkeL-STP3AdR6l2NTpulYyEv3hySb4kGEmQ"
          alt="MontyCloud"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Monty Fit
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm ${
                  errorMessage ? "border-red-500" : ""
                }`}
                placeholder="Enter your email address"
              />
            </div>
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 sm:text-sm ${
                  errorMessage ? "border-red-500" : ""
                }`}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Not a user?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
