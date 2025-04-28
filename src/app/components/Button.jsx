"use client";

export default function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-5 py-2 rounded-xl font-semibold
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-purple-600 hover:to-blue-500
        text-white shadow-lg transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
}
