
import React, { KeyboardEvent } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { MicrophoneIcon as MicrophoneIconOutline } from '@heroicons/react/24/outline';

interface ChatInputProps {
  userInput: string;
  setUserInput: (input: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  // Voice input related props
  onToggleVoiceInput: () => void;
  isListening: boolean;
  isVoiceInputSupported: boolean;
  isMicPermissionGranted: boolean;
  // showVoiceInfoPopup prop removed
  // onCloseVoiceInfoPopup prop removed
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  userInput, 
  setUserInput, 
  onSendMessage, 
  isLoading, 
  disabled,
  onToggleVoiceInput,
  isListening,
  isVoiceInputSupported,
  isMicPermissionGranted,
  // showVoiceInfoPopup removed
  // onCloseVoiceInfoPopup removed
}) => {
  
  const handleSend = () => {
    if (userInput.trim() && !isLoading && !disabled) {
      onSendMessage(userInput.trim());
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSend();
    }
  };

  const micButtonDisabled = !isVoiceInputSupported || !isMicPermissionGranted || disabled;
  
  return (
    <div className="p-3">
      <div className="flex items-center space-x-2">
        <div className="relative"> {/* Wrapper for microphone button */}
          <button
            onClick={onToggleVoiceInput}
            disabled={micButtonDisabled}
            className={`p-3 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
              ${micButtonDisabled
                ? 'bg-[#BBD69D]/70 text-[#475424]/70 cursor-not-allowed shadow-none'
                : isListening 
                  ? 'bg-[#EDB403] hover:bg-[#c9a002] text-[#1E2229] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 mic-listening-pulse'
                  : 'bg-[#475424] hover:bg-[#353f1c] text-[#BBD69D] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EDB403] focus:ring-opacity-75'
              }`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={!isVoiceInputSupported ? "Voice input not supported by your browser" : !isMicPermissionGranted ? "Microphone permission denied" : isListening ? "Stop voice input" : "Start voice input"}
            style={{ width: '48px', height: '48px' }}
          >
            {isListening ? (
              <MicrophoneIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIconOutline className="w-5 h-5" />
            )}
          </button>
          {/* Pop-up rendering logic removed */}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Chat unavailable..." : isListening ? "Listening..." : "Type your cravings..."}
          className={`flex-grow p-3 rounded-full outline-none transition-all duration-200 
            bg-white text-[#1E2229] placeholder-[#1E2229]/50 shadow-sm
            focus:ring-2 focus:ring-[#EDB403] 
            disabled:bg-[#BBD69D]/40 disabled:text-[#475424]/60 disabled:placeholder-[#475424]/40 disabled:cursor-not-allowed disabled:shadow-none`}
          aria-label="Chat message input"
          disabled={isLoading || disabled || isListening} // Disable text input while listening
        />
        <button
          onClick={handleSend}
          disabled={isLoading || disabled || !userInput.trim()}
          className={`p-3 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
            ${isLoading || disabled || !userInput.trim()
              ? 'bg-[#BBD69D]/70 text-[#475424]/70 cursor-not-allowed shadow-none'
              : 'bg-[#EDB403] hover:bg-[#c9a002] text-[#1E2229] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75'
            }`}
          aria-label="Send chat message"
          style={{ width: '48px', height: '48px' }}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-[#1E2229]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
