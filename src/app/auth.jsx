"use client"
import axios from "axios";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from "./zustand/useAuthStore";
import dotenv from "dotenv";

dotenv.config();

const Auth = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { authName, updateAuthName } = useAuthStore();

    const showAlert = (message, type = 'error') => {
        alert(message);
    };

    const loginFunc = async (event) => {
        event.preventDefault();
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
        
        if (!username || !password) {
            showAlert("Username and password are required");
            return;
        }

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_HOST}:8081/auth/login`, {
                username,
                password
            }, { withCredentials: true });
        
            updateAuthName(username);
            showAlert("Login successful!", "success");
            router.replace(redirect);
        } catch (error) {
            console.log("Error in login function : ", error.message);
            showAlert(error.response?.data?.message || "Login failed. Please try again.");
        }
    };
    
    const signUpFunc = async (event) => {
      event.preventDefault();
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
      
      if (!name || !email || !phoneNumber || !username || !password) {
          showAlert("All fields are required");
          return;
      }
  
      try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_HOST}:8081/auth/signup`, {
              name,
              email,
              phoneNumber,
              username,
              password
          }, { withCredentials: true });
      
          // Check for error message first
          if (res.data.message) {
              showAlert(res.data.message);
              return;
          }
          
          // If no message, assume success
          updateAuthName(username);
          showAlert("Registration successful!", "success");
          router.replace(redirect);
          
      } catch (error) {
          console.log("Error in signup function : ", error);
          showAlert(error.response?.data?.message || "Registration failed. Please try again.");
      }
  };
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={isLogin ? loginFunc : signUpFunc}>
                    {!isLogin && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isLogin 
                            ? "Don't have an account? Sign Up" 
                            : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;