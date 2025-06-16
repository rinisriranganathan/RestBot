
import React from 'react';
import { Balancer } from 'react-wrap-balancer';
import { ChatMessage, MenuItem, OrderItem } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { TasteButtons } from './TasteButtons'; // Import TasteButtons
import { MENU_ITEM_CATEGORIES_ORDER } from '../constants'; // Import category order

interface ChatMessageDisplayProps {
  message: ChatMessage;
  onQuickSuggestionClick?: (suggestion: string) => void;
  onCardAddItemClick: (item: MenuItem) => void; // New prop for card "Add" button
}

const ChatMessageDisplayComponent: React.FC<ChatMessageDisplayProps> = ({ 
  message, 
  onQuickSuggestionClick,
  onCardAddItemClick // Destructure new prop
}) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';

  const baseBubbleClasses = 'p-3 rounded-xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl shadow-md';
  const userBubbleClasses = `bg-[#EDB403] text-[#1E2229] ${baseBubbleClasses}`; 
  const botBubbleClasses = `bg-[#BBD69D] text-[#1E2229] ${baseBubbleClasses} ${message.isError ? 'border border-[#EDB403]' : 'border border-[#BBD69D]/80'}`;
  const systemBubbleClasses = `bg-[#F5F0E5] text-[#1E2229] ${baseBubbleClasses} border border-[#475424]/50 italic`;

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const safeMenuItemCategoriesOrder = Array.isArray(MENU_ITEM_CATEGORIES_ORDER) ? MENU_ITEM_CATEGORIES_ORDER : [];

  const isFullMenuDisplay = isBot && message.suggestions && message.suggestions.length > 0 &&
    message.suggestions.every(item => 
        item.reason && 
        typeof item.reason === 'string' && 
        safeMenuItemCategoriesOrder.includes(item.reason as MenuItem['category'])
    );

  const groupedSuggestions = isFullMenuDisplay && message.suggestions ?
    message.suggestions.reduce((acc, item) => {
      const category = item.category as MenuItem['category']; 
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<MenuItem['category'], MenuItem[]>)
    : null;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={
            isUser ? userBubbleClasses : 
            isBot ? botBubbleClasses : systemBubbleClasses
          }
        >
          <Balancer ratio={0.35}>
             <p className={`text-sm ${isUser ? 'text-[#1E2229]' : 'text-[#1E2229]'} ${message.isError && isBot ? 'text-[#475424] font-semibold' : ''}`}>{message.text}</p>
          </Balancer>
        </div>
        <span className="text-xs text-[#1E2229] opacity-75 mt-1 px-1">
          {isUser ? 'You' : isBot ? 'Froastie' : 'System'} - {formatTimestamp(message.timestamp)}
        </span>
      </div>
      
      {isBot && message.commandHintText && (
         <div className="mt-2 ml-1 p-2 rounded-md bg-[#EDB403]/20 border border-[#EDB403]/40 text-[#475424] font-semibold w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl self-start shadow">
          <Balancer ratio={0.35}>
            <p>💡 {message.commandHintText}</p>
          </Balancer>
        </div>
      )}

      {isBot && message.quickSuggestions && message.quickSuggestions.length > 0 && onQuickSuggestionClick && (
         <div className="mt-3 ml-1 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl self-start" aria-label="Quick suggestions">
          <TasteButtons 
            suggestions={message.quickSuggestions} 
            onSuggestionClick={(suggestionText) => {
              if (onQuickSuggestionClick) {
                onQuickSuggestionClick(suggestionText);
              }
            }} 
          />
        </div>
      )}

      {isBot && message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-3 w-full" aria-live="polite"> 
          {!isFullMenuDisplay && (
            <p className="text-sm text-[#1E2229] mb-2 ml-1">{'Here are some ideas based on our chat:'}</p>
          )}
          
          {isFullMenuDisplay && groupedSuggestions ? (
            safeMenuItemCategoriesOrder.map(category => (
              groupedSuggestions[category] && groupedSuggestions[category].length > 0 && (
                <div key={category} className="mb-6">
                  <h3 className="text-xl font-semibold text-[#475424] mt-4 mb-3 col-span-full ml-1">{category}s</h3>
                  <div className="grid grid-cols-1 gap-3"> 
                    {groupedSuggestions[category].map((item: MenuItem) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        reason={item.reason}
                        onAddItem={onCardAddItemClick} // Pass the handler
                      />
                    ))}
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="grid grid-cols-1 gap-3"> 
              {message.suggestions.map((item: MenuItem) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  reason={item.reason}
                  onAddItem={onCardAddItemClick} // Pass the handler
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ChatMessageDisplay = React.memo(ChatMessageDisplayComponent);
