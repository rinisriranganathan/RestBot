
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Balancer, Provider as BalancerProvider } from 'react-wrap-balancer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ChatMessageDisplay } from '../components/ChatMessageDisplay';
import { ChatInput } from '../components/ChatInput';
import { LiveOrderSummary } from '../components/LiveOrderSummary';
import { MenuItem, ChatMessage, SuggestedItem, OrderItem, MenuItemForPrompt } from '../types';
// Removed: import { MENU_ITEMS } from '../constants'; 
import { startChat, sendMessageToBot, ParsedBotResponse } from '../services/geminiService';
import type { Chat } from '@google/genai';
import type { Page } from '../App';

interface ChatPageProps {
  menuItems: MenuItem[]; // Added menuItems prop
  navigateTo: (page: Page) => void;
  orderItems: OrderItem[];
  onAddItemToOrder: (item: MenuItem, quantity: number, customizationNotes?: string) => void;
  onUpdateOrderItemQuantity: (itemId: string, newQuantity: number, itemCustomizationNotes?: string) => void;
  onRemoveOrderItem: (itemId: string, itemCustomizationNotes?: string) => void;
  onMultiItemOrder: (orders: { itemName: string; quantity: number; customizationNotes?: string }[], addSystemMessageToChat?: (text: string) => void) => void;
  onMultiItemRemoval: (removals: { itemName: string; quantity: number; customizationNotes?: string }[], addSystemMessageToChat?: (text: string) => void) => void;
  onCheckoutAndGoToBill: () => boolean;
  parsePrice: (priceString: string) => number;
  formatPrice: (priceNumber: string | number) => string;
  calculateOrderTotal: (orderItems: OrderItem[]) => string;
  getItemNameWithPieces: (item: MenuItem | OrderItem) => string;
}

const parseQuantityWord = (word: string): number | null => {
  const s = word.toLowerCase().trim();
  const numberWords: Record<string, number> = {
    'one': 1, 'a': 1, 'an': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7,
    'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12,
    'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
    'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
  };
  return numberWords[s] || null;
};

const parseRemoveCommandArgs = (args: string): { quantity: number; itemName: string; customizationNotes?: string } | null => {
  const trimmedArgs = args.trim();
  if (!trimmedArgs) return null;

  const words = trimmedArgs.split(/\s+/);
  let quantity = 1;
  let itemName = "";
  if (words.length === 0) return null;
  if (words.length === 1) { itemName = words[0]; }
  else {
    const firstWord = words[0];
    const parsedNum = parseInt(firstWord, 10);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      quantity = parsedNum;
      itemName = words.slice(1).join(' ');
    } else {
      const wordNum = parseQuantityWord(firstWord);
      if (wordNum !== null && wordNum > 0) {
        quantity = wordNum;
        itemName = words.slice(1).join(' ');
      } else {
        itemName = trimmedArgs; 
        quantity = 1;
      }
    }
  }
  if (!itemName.trim()) return null;
  return { quantity, itemName }; 
};


const ChatPage: React.FC<ChatPageProps> = ({
  menuItems,
  navigateTo,
  orderItems,
  onAddItemToOrder,
  onUpdateOrderItemQuantity,
  onRemoveOrderItem,
  onMultiItemOrder,
  onMultiItemRemoval,
  onCheckoutAndGoToBill,
  parsePrice,
  formatPrice,
  calculateOrderTotal,
  getItemNameWithPieces
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [geminiChat, setGeminiChat] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isChatSessionCheckingOut, setIsChatSessionCheckingOut] = useState<boolean>(false);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceInputSupported, setIsVoiceInputSupported] = useState<boolean>(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState<boolean>(true);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const menuSummaryForPrompt = useMemo((): MenuItemForPrompt[] => {
    return menuItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      tasteProfiles: item.tasteProfiles,
      description: item.description ? (item.description.substring(0, 70) + (item.description.length > 70 ? "..." : "")) : "",
      pieces: item.pieces
    }));
  }, [menuItems]);


  const addSystemMessage = useCallback((text: string, isConfirmationPrompt: boolean = false) => {
    setChatMessages(prev => [...prev, {
      id: `system-${Date.now()}`, sender: 'system', text, timestamp: new Date(),
      isOrderConfirmationPrompt: isConfirmationPrompt,
    }]);
  }, []);


  const handleSendMessage = useCallback(async (messageText: string) => {
    const currentMessageText = messageText.trim();
    if (apiKeyMissing) {
      setError("Cannot send message: API Key is not configured.");
      addSystemMessage("Chat features are disabled due to a configuration issue.");
      return;
    }
    if (isLoading || !currentMessageText) return;

    if (isListeningRef.current && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`, sender: 'user', text: currentMessageText, timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');

    const parts = currentMessageText.toLowerCase().split(/\s+/);
    const command = parts[0];
    const commandArgs = parts.slice(1).join(' ');

    if (command.startsWith('/')) {
      switch (command) {
        case '/add':
          addSystemMessage("The `/add` command is not an active command. To add items, please tell Froastie directly, like 'add two samosas and a lassi, make one samosa extra spicy'. You can also use the 'Add' button on suggested item cards.");
          break;
        case '/remove':
          const parsedArgsSlash = parseRemoveCommandArgs(commandArgs);
          if (!parsedArgsSlash) {
            addSystemMessage("Usage: /remove [quantity] [item name]. For customized items, Froastie will try to identify it or ask for clarification.");
          } else {
            onMultiItemRemoval([{ itemName: parsedArgsSlash.itemName, quantity: parsedArgsSlash.quantity }], addSystemMessage);
          }
          break;
        case '/vieworder':
          addSystemMessage(orderItems.length > 0 ? "Please check 'Your Culinary Cart' panel for your current order details." : "Your Culinary Cart is currently empty.");
          break;
        case '/checkout':
          if (orderItems.length === 0) {
            addSystemMessage("Your cart is empty. Add some items before checking out!");
          } else {
            setIsChatSessionCheckingOut(true);
            addSystemMessage("Ready to place your order? Please review your Culinary Cart, then type 'confirmorder' or '/confirmorder' to review your bill. To cancel, type 'cancelorder' or '/cancelorder'.", true);
          }
          break;
        case '/confirmorder':
          if (isChatSessionCheckingOut && orderItems.length > 0) {
            const navigated = onCheckoutAndGoToBill(); 
            if (navigated) {
                 addSystemMessage("Order confirmed! Proceeding to review your bill...");
                 setIsChatSessionCheckingOut(false);
            } else {
                addSystemMessage("Could not proceed to bill. Please ensure your cart is not empty.");
            }
          } else if (!isChatSessionCheckingOut) {
            addSystemMessage("You need to start checkout first with '/checkout'.");
          } else {
            addSystemMessage("Your cart is empty. Cannot confirm an empty order.");
          }
          break;
        case '/cancelorder':
          if (isChatSessionCheckingOut) {
            setIsChatSessionCheckingOut(false);
            addSystemMessage("Checkout cancelled. You can continue shopping or modify your cart.");
          } else {
            addSystemMessage("No active checkout to cancel.");
          }
          break;
        default:
          addSystemMessage(`Unknown command: ${command}. Available: /remove, /vieworder, /checkout, /confirmorder, /cancelorder. Or just chat with Froastie!`);
          break;
      }
      return;
    } else {
        const lowerMessageText = currentMessageText.toLowerCase();
        
        if (lowerMessageText === 'vieworder' || lowerMessageText === 'view order') {
            addSystemMessage(orderItems.length > 0 ? "Please check 'Your Culinary Cart' panel for your current order details." : "Your Culinary Cart is currently empty.");
            return;
        }
        if (lowerMessageText === 'checkout') {
            if (orderItems.length === 0) {
                addSystemMessage("Your cart is empty. Add some items before checking out!");
            } else {
                setIsChatSessionCheckingOut(true);
                addSystemMessage("Ready to place your order? Review your cart, then type 'confirmorder' to review your bill. To cancel, type 'cancelorder'.", true);
            }
            return;
        }
        if (lowerMessageText === 'confirmorder' || lowerMessageText === 'confirm order') {
             if (isChatSessionCheckingOut && orderItems.length > 0) {
                const navigated = onCheckoutAndGoToBill(); 
                if (navigated) {
                    addSystemMessage("Order confirmed! Proceeding to review your bill...");
                    setIsChatSessionCheckingOut(false);
                } else {
                     addSystemMessage("Could not proceed to bill. Cart might be empty.");
                }
            } else if (!isChatSessionCheckingOut) {
                addSystemMessage("You need to start checkout first with 'checkout'.");
            } else {
                addSystemMessage("Your cart is empty.");
            }
            return;
        }
        if (lowerMessageText === 'cancelorder' || lowerMessageText === 'cancel order') {
            if (isChatSessionCheckingOut) {
                setIsChatSessionCheckingOut(false);
                addSystemMessage("Checkout cancelled.");
            } else {
                addSystemMessage("No active checkout to cancel.");
            }
            return;
        }
    }


    if (!geminiChat) {
      setError("Chat service is not initialized. Please wait or refresh.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const botResponse: ParsedBotResponse = await sendMessageToBot(geminiChat, currentMessageText, menuSummaryForPrompt);
      const suggestionsMenuItems = botResponse.suggestions
        ? botResponse.suggestions.map(sugg => {
          const item = menuItems.find(m => m.id === sugg.id); // Use menuItems prop
          return item ? { ...item, reason: sugg.reason } : null;
        }).filter(Boolean) as MenuItem[]
        : undefined;

      const newBotMessage: ChatMessage = {
        id: `bot-${Date.now()}`, sender: 'bot',
        text: botResponse.text || "...",
        suggestions: suggestionsMenuItems,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newBotMessage]);

      if (botResponse.orderIntent && botResponse.orderIntent.length > 0) {
        onMultiItemOrder(botResponse.orderIntent, addSystemMessage);
      }
      if (botResponse.removeIntent && botResponse.removeIntent.length > 0) {
        onMultiItemRemoval(botResponse.removeIntent, addSystemMessage);
      }
      if (botResponse.checkoutIntent) {
        if (orderItems.length > 0) {
          const navigated = onCheckoutAndGoToBill();
          if (navigated) {
            setIsChatSessionCheckingOut(false); 
          } else {
            addSystemMessage("It seems there was an issue proceeding to the bill. Please ensure your cart isn't empty.");
          }
        }
      }

    } catch (err) {
      console.error("Error sending message or processing response:", err);
      const errorMessage = err instanceof Error ? err.message : "Sorry, I encountered an issue. Please try again.";
      setError(errorMessage);
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`, sender: 'bot', text: errorMessage,
        timestamp: new Date(), isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyMissing, isLoading, geminiChat, onCheckoutAndGoToBill, addSystemMessage, menuSummaryForPrompt, onMultiItemOrder, onMultiItemRemoval, orderItems, isChatSessionCheckingOut, menuItems]); // Added menuItems to dependency array


  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      :root {
        --header-height: ${document.querySelector('header')?.offsetHeight || 60}px;
        --footer-height: ${document.querySelector('footer')?.offsetHeight || 40}px;
      }
    `;
    document.head.appendChild(styleElement);
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarListAPI = window.SpeechGrammarList || window.webkitSpeechGrammarList;

    if (SpeechRecognitionAPI) {
      setIsVoiceInputSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false; 
      recognitionInstance.interimResults = true; 
      recognitionInstance.lang = 'en-IN'; 
      recognitionInstance.maxAlternatives = 5;

      if (SpeechGrammarListAPI && menuItems.length > 0) { // Use menuItems prop
        const speechRecognitionGrammarList = new SpeechGrammarListAPI();
        const numbers = [
          'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
          'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ];
        const grammarTerms = [
          ...menuItems.map(item => item.name.toLowerCase()), // Use menuItems prop
          ...numbers
        ].join(' | ');
        
        const grammar = `#JSGF V1.0; grammar appCommandsAndItems; public <commandOrItem> = ${grammarTerms} ;`;
        speechRecognitionGrammarList.addFromString(grammar, 1);
        recognitionInstance.grammars = speechRecognitionGrammarList;
      }


      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false); 

        if (event.error === 'aborted') {
          console.info("Speech recognition aborted. Usually intentional.");
          return; 
        }

        if (event.error === 'no-speech') {
            console.info('Speech recognition error: no-speech. User will be informed in chat.');
        } else {
            console.error('Speech recognition error:', event.error, event.message);
        }
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          addSystemMessage("Microphone permission was denied. Please enable it in your browser settings to use voice input.");
          setIsMicPermissionGranted(false);
        } else if (event.error === 'no-speech') {
          addSystemMessage("No speech was detected. Please try again.");
        } else {
          addSystemMessage(`Voice input error: ${event.error}. Please try again or type your message.`);
        }
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let receivedFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript; 
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
            receivedFinalResult = true;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        const currentDisplayTranscript = finalTranscript || interimTranscript;
        setUserInput(currentDisplayTranscript); 

        if (receivedFinalResult && finalTranscript.trim() && isListeningRef.current) {
            handleSendMessage(finalTranscript.trim());
        }
      };
      speechRecognitionRef.current = recognitionInstance;

      return () => {
        if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
        }
        if (recognitionInstance) {
            recognitionInstance.abort(); 
        }
      };
    } else {
      setIsVoiceInputSupported(false);
      return () => {
        if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
        }
      };
    }
  }, [addSystemMessage, handleSendMessage, menuItems]); // Added menuItems to dependency array


  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("API Key is not configured. Culinary Genie chat is unavailable.");
      setApiKeyMissing(true);
      setIsLoading(false);
      return;
    }
    setError(null);
    setApiKeyMissing(false);
    setIsLoading(true);
    const initializeChat = async () => {
      try {
        const chat = await startChat(menuSummaryForPrompt);
        setGeminiChat(chat);
        setChatMessages([
          {
            id: 'initial-bot-message', sender: 'bot',
            text: "Welcome to Fire & Froast! I'm Froastie, your culinary assistant. What kind of flavors or dishes are you in the mood for today? Feel free to ask for customizations! You can also ask to see the 'full menu'.\n\nOr, tap a quick suggestion below:",
            timestamp: new Date(),
            quickSuggestions: [
              'CAT:Appetizers',
              'CAT:Main Courses',
              'CAT:Desserts',
              'CAT:Drinks',
              'Spicy',
              'Sweet',
              'Savory',
              'Light',
              'Refreshing'
            ]
          }
        ]);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError(err instanceof Error ? err.message : "Failed to start chat session.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, [menuSummaryForPrompt]); // menuSummaryForPrompt depends on menuItems, so this covers menuItems changes for init

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (orderItems.length === 0) {
      setIsChatSessionCheckingOut(false);
    }
  }, [orderItems]);


  const handleToggleVoiceInput = useCallback(() => {
    if (!isVoiceInputSupported || !speechRecognitionRef.current) {
      if(!isVoiceInputSupported) addSystemMessage("Voice input is not supported in your browser.");
      return;
    }
    if (!isMicPermissionGranted) {
        addSystemMessage("Microphone access is denied. Please enable it in your browser settings and refresh the page.");
        return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      try {
        speechRecognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        addSystemMessage("Could not start voice input. Ensure microphone is not in use by another app and permissions are granted.");
        setIsListening(false); 
      }
    }
  }, [isListening, isVoiceInputSupported, addSystemMessage, isMicPermissionGranted]);
  
  const handleCardAddItem = useCallback((item: MenuItem) => {
    onAddItemToOrder(item, 1); // Default quantity 1, no customization notes from card
    // Optionally, add a system message confirmation here if desired
    addSystemMessage(`${getItemNameWithPieces(item)} added to your cart!`);
  }, [onAddItemToOrder, addSystemMessage, getItemNameWithPieces]);

  return (
    <BalancerProvider>
      <div className="flex flex-col md:flex-row flex-grow w-full max-w-6xl mx-auto overflow-hidden gap-4 md:gap-6 py-0 md:py-0">
        <div className="flex-grow flex flex-col min-w-0 md:w-4/5 lg:w-3/4 bg-[#F5F0E5] rounded-xl shadow-md overflow-hidden border border-[#BBD69D]/50">
          <div ref={chatContainerRef} id="chat-container" className="flex-grow overflow-y-auto space-y-4 p-3 md:p-4 scroll-smooth">
            {chatMessages.map(msg => (
              <ChatMessageDisplay
                key={msg.id}
                message={msg}
                onQuickSuggestionClick={handleSendMessage} 
                onCardAddItemClick={handleCardAddItem} // Pass the handler for card "Add" button
              />
            ))}
            {isLoading && chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.sender === 'user' && (
              <div className="flex items-start">
                <div className="p-3 rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl shadow-md bg-[#BBD69D] text-[#1E2229] border border-[#BBD69D]/80">
                  <Balancer>
                    <p className="text-sm text-[#1E2229] italic">Froastie is thinking...</p>
                  </Balancer>
                </div>
              </div>
            )}
          </div>

          {apiKeyMissing && error && (
            <div className="p-4">
              <ErrorDisplay message={error} />
            </div>
          )}
          {!apiKeyMissing && error && !chatMessages.some(msg => msg.isError) && (
             <div className="p-4">
               <ErrorDisplay message={error} />
             </div>
          )}


          <ChatInput
            userInput={userInput}
            setUserInput={setUserInput}
            onSendMessage={() => handleSendMessage(userInput)}
            isLoading={isLoading}
            disabled={apiKeyMissing || !geminiChat}
            onToggleVoiceInput={handleToggleVoiceInput}
            isListening={isListening}
            isVoiceInputSupported={isVoiceInputSupported}
            isMicPermissionGranted={isMicPermissionGranted}
          />
        </div>

        <div className="w-full md:w-1/5 lg:w-1/4 md:max-h-[calc(100vh-var(--header-height)-var(--footer-height)-2rem)] md:sticky md:top-[calc(var(--header-height)+1rem)]">
          <LiveOrderSummary
            orderItems={orderItems}
            isLoading={isLoading || isChatSessionCheckingOut}
            onUpdateQuantity={onUpdateOrderItemQuantity}
            onRemoveItem={onRemoveOrderItem}
            onPlaceOrder={() => { 
              if (orderItems.length === 0) {
                addSystemMessage("Your cart is empty. Please add items before proceeding.");
                return;
              }
              const navigated = onCheckoutAndGoToBill(); 
              if (navigated) {
                   if (!isChatSessionCheckingOut) { 
                      addSystemMessage("Proceeding to review your bill...");
                   }
              } else {
                   addSystemMessage("Could not proceed. Ensure cart is not empty and try again.");
              }
            }}
            parsePrice={parsePrice}
            formatPrice={formatPrice}
            calculateOrderTotal={calculateOrderTotal}
            getItemNameWithPieces={getItemNameWithPieces}
          />
        </div>
      </div>
    </BalancerProvider>
  );
};

export default ChatPage;
