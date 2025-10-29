import React from "react";
import { Mic, MicOff } from "lucide-react";
const VoiceButton = ({
  isListening,
  onToggle,
  isSupported = true,
  disabled = false,
  size = "md",
  className = "",
  confidence = 0,
}) => {
  if (!isSupported) return null;
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-200 flex items-center justify-center
        ${
          isListening
            ? "bg-red-500 text-white shadow-lg hover:bg-red-600 ring-4 ring-red-200 animate-pulse"
            : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/80 shadow-md hover:shadow-lg"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      title={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
export default VoiceButton;