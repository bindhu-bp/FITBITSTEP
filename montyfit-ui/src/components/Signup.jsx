import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Signup = () => {
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpDesignation, setSignUpDesignation] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signUpPassword === confirmPassword) {
      try {
        const response = await axios.post(
          "https://jrl72ep0hb.execute-api.us-east-1.amazonaws.com/dev/signup",
          {
            signUpName,
            signUpEmail,
            signUpDesignation,
            signUpPhone,
            signUpPassword,
          }
        );
        if (response.data.message === "valid") {
          toast.success("User Account Created Successfully. Click on Sign in here.");
          navigate("/login");
        } else if (response.data.message === "invalid") {
          setErrorMessage("Error while creating Account");
          toast.error("Error while creating Account");
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage("Password do not match.");
      toast.error("Password do not match.");
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-4 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-20 w-auto"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_e-XN_I7Jj-NiuE0t7a4TqvsZWqz8aRSkMkeL-STP3AdR6l2NTpulYyEv3hySb4kGEmQ"
          alt="MontyCloud"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 ">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="designation"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Designation
            </label>
            <div className="mt-1">
              <input
                id="designation"
                name="designation"
                type="text"
                autoComplete="new-designation"
                value={signUpDesignation}
                onChange={(e) => setSignUpDesignation(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm"
                placeholder="Enter your designation"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

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
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm ${
                  errorMessage ? "border-red-500" : ""
                }`}
                placeholder="Enter your email address"
                required
              />
            </div>
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
                autoComplete="new-password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm ${
                  errorMessage ? "border-red-500" : ""
                }`}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 sm:text-sm ${
                  errorMessage ? "border-red-500" : ""
                }`}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
