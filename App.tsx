
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import ChatPage from './pages/ChatPage';
import BillPage from './pages/BillPage';
import WelcomePage from './pages/WelcomePage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import { OrderItem, MenuItem } from './types';
import { DEFAULT_MENU_ITEMS, GST_RATE } from './constants';
import { parseMenuItemsFromExcel } from './utils/excelParser';

export type Page = 'welcome' | 'chat' | 'bill' | 'finalConfirmation';

interface BillDataType {
  items: OrderItem[];
  subtotal: string;
  gstAmount: string;
  grandTotal: string;
  tableNumber: string;
}

const parsePrice = (priceString: string): number => parseFloat(priceString.replace('₹', ''));
const formatPrice = (priceNumber: number): string => `₹${priceNumber.toFixed(2)}`;

const getItemNameWithPiecesForBill = (item: OrderItem): string => {
    const pieceInfo = item.pieces ? ` (${item.pieces} pc${item.pieces > 1 ? 's' : ''})` : '';
    const customizationInfo = item.customizationNotes ? ` (Custom: ${item.customizationNotes})` : '';
    return `${item.name}${pieceInfo}${customizationInfo}`;
};

const downloadBillAsText = async (
  tableNumber: number,
  items: OrderItem[],
  subtotal: number,
  gstAmount: number,
  grandTotal: number
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const timestampForFile = now.toISOString().replace(/[:.]/g, '-');
  const filename = `Fire_Froast_Table_${tableNumber}_Order_${timestampForFile}.txt`;

  let billContent = `🧾 Fire & Froast Bill\n`;
  billContent += `Table No: ${tableNumber}\n`;
  billContent += `----------------------\n`;

  items.forEach(item => {
    const itemName = getItemNameWithPiecesForBill(item);
    const itemPrice = parsePrice(item.price);
    const itemTotal = itemPrice * item.quantity;
    billContent += `${item.quantity} x ${itemName} = ${formatPrice(itemTotal)}\n`;
  });

  billContent += `----------------------\n`;
  billContent += `Subtotal: ${formatPrice(subtotal)}\n`;
  billContent += `GST: ${formatPrice(gstAmount)}\n`;
  billContent += `Total: ${formatPrice(grandTotal)}\n`;
  billContent += `Time: ${dateStr}, ${timeStr}\n`;

  const blob = new Blob([billContent], { type: 'text/plain;charset=utf-8' });

  const formData = new FormData();
  formData.append('file', blob, filename);

  try {
    const response = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Bill uploaded successfully:', data.url);
    alert(`✅ Bill uploaded!\n📄 Access here:\n${data.url}`);
  } catch (error) {
    console.error('❌ Failed to upload bill:', error);
    alert('Failed to upload the bill. Please check your server.');
  }
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentBillData, setCurrentBillData] = useState<BillDataType | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('1');
  const [activeMenuItems, setActiveMenuItems] = useState<MenuItem[]>([]); // Initialize as empty, to be loaded
  const [menuLoadingError, setMenuLoadingError] = useState<string | null>(null);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);


  useEffect(() => {
    const loadMenu = async () => {
      setIsMenuLoading(true);
      setMenuLoadingError(null);

      try {
        const storedMenuJson = localStorage.getItem('fireFroastMenu');
        if (storedMenuJson) {
          const storedMenu = JSON.parse(storedMenuJson) as MenuItem[];
          if (Array.isArray(storedMenu) && storedMenu.length > 0) {
            setActiveMenuItems(storedMenu);
            setIsMenuLoading(false);
            console.log("Menu loaded from localStorage.");
            return; 
          }
        }
        console.log("No valid menu in localStorage, attempting to load from /menu.xlsx");
        // Fetch menu.xlsx from the public path (root of the server)
        const response = await fetch('/menu.xlsx');
        if (!response.ok) {
          throw new Error(`Failed to fetch menu.xlsx: ${response.statusText}. Please ensure 'menu.xlsx' is in the public root of your project.`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const parsedItems = await parseMenuItemsFromExcel(arrayBuffer);

        if (parsedItems.length === 0) {
          setMenuLoadingError("The menu.xlsx file is empty or invalid. Using default menu.");
          setActiveMenuItems(DEFAULT_MENU_ITEMS);
          localStorage.setItem('fireFroastMenu', JSON.stringify(DEFAULT_MENU_ITEMS));
        } else {
          setActiveMenuItems(parsedItems);
          localStorage.setItem('fireFroastMenu', JSON.stringify(parsedItems));
          console.log("Menu successfully loaded from /menu.xlsx and stored in localStorage.");
        }
      } catch (error) {
        console.error("Error loading or parsing menu.xlsx:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while loading the menu.";
        setMenuLoadingError(`Failed to load menu from Excel file: ${errorMessage}. Using default built-in menu. Please ensure 'menu.xlsx' is correctly formatted and placed in the project root.`);
        setActiveMenuItems(DEFAULT_MENU_ITEMS);
        localStorage.setItem('fireFroastMenu', JSON.stringify(DEFAULT_MENU_ITEMS)); // Store default on error
      } finally {
        setIsMenuLoading(false);
      }
    };

    loadMenu();
  }, []);


  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const getItemNameWithPieces = useCallback((item: MenuItem | OrderItem): string => {
    const pieceInfo = item.pieces ? ` (${item.pieces} pc${item.pieces > 1 ? 's' : ''})` : '';
    const customizationNotes = 'customizationNotes' in item ? item.customizationNotes : undefined;
    const customizationInfo = customizationNotes ? ` (Custom: ${customizationNotes})` : '';
    return `${item.name}${pieceInfo}${customizationInfo}`;
  }, []);

  const calculateSubtotal = (currentOrderItems: OrderItem[]): string => {
    const total = currentOrderItems.reduce((sum, item) => {
      return sum + (parsePrice(item.price) * item.quantity);
    }, 0);
    return formatPrice(total);
  };

  const handleAddItemToOrder = useCallback((itemToAdd: MenuItem, quantity: number = 1, customizationNotes?: string) => {
    setOrderItems(prevOrder => {
      const existingItemIndex = prevOrder.findIndex(oi => oi.id === itemToAdd.id && (oi.customizationNotes || '') === (customizationNotes || ''));
      let newOrder;
      if (existingItemIndex > -1) {
        newOrder = prevOrder.map((oi, index) =>
          index === existingItemIndex ? { ...oi, quantity: oi.quantity + quantity } : oi
        );
      } else {
        newOrder = [...prevOrder, { ...itemToAdd, quantity: quantity, customizationNotes: customizationNotes }];
      }
      return newOrder;
    });
  }, []);

  const handleUpdateOrderItemQuantity = useCallback((itemId: string, newQuantity: number, itemCustomizationNotes?: string) => {
    setOrderItems(prevOrder => {
      if (newQuantity <= 0) {
        return prevOrder.filter(item => !(item.id === itemId && (item.customizationNotes || '') === (itemCustomizationNotes || '')));
      }
      return prevOrder.map(item =>
        (item.id === itemId && (item.customizationNotes || '') === (itemCustomizationNotes || ''))
        ? { ...item, quantity: newQuantity } 
        : item
      );
    });
  }, []);

  const handleRemoveOrderItem = useCallback((itemId: string, itemCustomizationNotes?: string) => {
    setOrderItems(prevOrder => prevOrder.filter(item => !(item.id === itemId && (item.customizationNotes || '') === (itemCustomizationNotes || ''))));
  }, []);

  const handleMultiItemOrder = useCallback((
    orders: { itemName: string; quantity: number; customizationNotes?: string }[], 
    addSystemMessageToChat?: (text: string) => void
  ) => {
      setOrderItems(prevOrder => {
        let workingOrder = [...prevOrder];
        let itemsActuallyProcessed = false;
        const notFoundItems: string[] = [];
        const actionMessages: string[] = [];

        for (const order of orders) {
          const menuItem = activeMenuItems.find(item => item.name.toLowerCase() === order.itemName.toLowerCase().trim());
          
          if (!menuItem) {
            notFoundItems.push(order.itemName);
            continue;
          }

          itemsActuallyProcessed = true;
          const incomingNotes = order.customizationNotes || '';
          const incomingQuantity = order.quantity;
          
          const tempItemForName: OrderItem = { ...menuItem, quantity: 0, customizationNotes: incomingNotes, description: menuItem.description, image: menuItem.image, category: menuItem.category, tasteProfiles: menuItem.tasteProfiles, price: menuItem.price };
          const itemNameWithIncomingNotes = getItemNameWithPieces(tempItemForName);

          const exactMatchIndex = workingOrder.findIndex(oi => oi.id === menuItem.id && (oi.customizationNotes || '') === incomingNotes);

          if (exactMatchIndex > -1) {
            workingOrder[exactMatchIndex].quantity += incomingQuantity;
            actionMessages.push(`Increased quantity of ${itemNameWithIncomingNotes} by ${incomingQuantity}.`);
          } else {
            if (incomingNotes !== '') { 
              const plainItemIndex = workingOrder.findIndex(oi => oi.id === menuItem.id && (!oi.customizationNotes || oi.customizationNotes === ''));
              
              if (plainItemIndex > -1) { 
                const plainItemBeingTransformed = workingOrder[plainItemIndex];
                const plainItemNameForMessage = getItemNameWithPieces(plainItemBeingTransformed);
                const originalPlainQuantity = plainItemBeingTransformed.quantity;

                workingOrder.splice(plainItemIndex, 1);
                
                const existingCustomizedItemIndex = workingOrder.findIndex(oi => oi.id === menuItem.id && (oi.customizationNotes || '') === incomingNotes);
                if (existingCustomizedItemIndex > -1) {
                    workingOrder[existingCustomizedItemIndex].quantity += incomingQuantity;
                } else {
                    workingOrder.push({ ...menuItem, quantity: incomingQuantity, customizationNotes: incomingNotes });
                }
                actionMessages.push(`Changed ${plainItemNameForMessage} (initially qty ${originalPlainQuantity}) to ${incomingQuantity} x ${itemNameWithIncomingNotes}.`);
                continue; 
              }
            }
            workingOrder.push({ ...menuItem, quantity: incomingQuantity, customizationNotes: incomingNotes });
            actionMessages.push(`Added ${incomingQuantity} x ${itemNameWithIncomingNotes}.`);
          }
        }
        
        if (addSystemMessageToChat) {
            if (notFoundItems.length > 0) {
                addSystemMessageToChat(`Could not find: ${notFoundItems.join(', ')} on the menu.`);
            }
            if (!itemsActuallyProcessed && notFoundItems.length === 0 && orders.length > 0) {
                addSystemMessageToChat("I couldn't identify any items from your request to add to the order.");
            }
        }
        return workingOrder;
      });
  }, [getItemNameWithPieces, activeMenuItems]); 
  
  const handleMultiItemRemoval = useCallback((
    removals: { itemName: string; quantity: number; customizationNotes?: string }[], 
    addSystemMessageToChat?: (text: string) => void
  ) => {
    setOrderItems(prevOrder => {
      let workingOrder = [...prevOrder];
      let itemsActuallyProcessed = false;
      const notFoundOrNotInOrder: string[] = [];
      const removedItemsMessages: string[] = [];

      for (const removal of removals) {
        const menuItem = activeMenuItems.find(item => item.name.toLowerCase() === removal.itemName.toLowerCase().trim());
        if (!menuItem) {
          notFoundOrNotInOrder.push(`'${removal.itemName}' (not on menu)`);
          continue;
        }

        const notes = removal.customizationNotes || '';
        const existingItemIndex = workingOrder.findIndex(oi => oi.id === menuItem.id && (oi.customizationNotes || '') === notes);

        if (existingItemIndex === -1) {
           let searchName = menuItem.name;
           if(notes) searchName += ` (Custom: ${notes})`;
           notFoundOrNotInOrder.push(`'${searchName}' (not in current order or exact customization not found)`);
          continue;
        }
        
        itemsActuallyProcessed = true;
        const itemInOrder = workingOrder[existingItemIndex];
        const quantityToRemove = removal.quantity;
        let itemNameForMessage = getItemNameWithPieces(itemInOrder); 

        if (quantityToRemove >= itemInOrder.quantity) {
          workingOrder = workingOrder.filter((_, index) => index !== existingItemIndex);
          removedItemsMessages.push(`Removed all ${itemNameForMessage}`);
        } else {
          workingOrder = workingOrder.map((oi, index) =>
            index === existingItemIndex ? { ...oi, quantity: oi.quantity - quantityToRemove } : oi
          );
          removedItemsMessages.push(`Reduced ${itemNameForMessage} by ${quantityToRemove}`);
        }
      }

      if (addSystemMessageToChat) {
        if (notFoundOrNotInOrder.length > 0) {
            addSystemMessageToChat(`Could not process removals for: ${notFoundOrNotInOrder.join(', ')}.`);
        }
         if (!itemsActuallyProcessed && notFoundOrNotInOrder.length === 0 && removals.length > 0) { 
            addSystemMessageToChat("I couldn't identify any items from your request to remove.");
        }
      }
      return workingOrder;
    });
  }, [getItemNameWithPieces, activeMenuItems]);

  const navigateToChatFromWelcome = useCallback(() => {
    if (isMenuLoading || activeMenuItems.length === 0) { // Prevent navigation if menu is still loading or empty
      setMenuLoadingError("Menu is still loading or not available. Please wait.");
      return;
    }
    setMenuLoadingError(null); // Clear any previous loading errors
    navigateTo('chat');
  }, [navigateTo, isMenuLoading, activeMenuItems]);

  const handleCheckoutAndGoToBill = useCallback(() => {
    if (orderItems.length === 0) {
      return false; 
    }
    const subtotalNum = parsePrice(calculateSubtotal(orderItems));
    const gstAmountNum = subtotalNum * GST_RATE;
    const grandTotalNum = subtotalNum + gstAmountNum;

    setCurrentBillData({
      items: [...orderItems], 
      subtotal: formatPrice(subtotalNum),
      gstAmount: formatPrice(gstAmountNum),
      grandTotal: formatPrice(grandTotalNum),
      tableNumber: tableNumber,
    });
    navigateTo('bill');
    return true;
  }, [orderItems, navigateTo, tableNumber, calculateSubtotal]); 

  const handleConfirmOrderAndGoToFinalConfirmation = useCallback(() => {
    if (currentBillData && currentBillData.items.length > 0) {
      const tableNum = parseInt(currentBillData.tableNumber);
      downloadBillAsText(
        tableNum, 
        currentBillData.items,
        parsePrice(currentBillData.subtotal),
        parsePrice(currentBillData.gstAmount),
        parsePrice(currentBillData.grandTotal)
      );
      setOrderItems([]); 
      navigateTo('finalConfirmation');
    } else {
      navigateTo('chat');
    }
  }, [navigateTo, currentBillData]);

  const handleStartNewOrderFromFinalConfirmation = useCallback(() => {
    setCurrentBillData(null); 
    navigateTo('welcome');
  }, [navigateTo]);

  const isFullScreenPage = currentPage === 'welcome' || currentPage === 'finalConfirmation';
  const appBgColor = (currentPage === 'welcome' || currentPage === 'finalConfirmation') ? 'bg-[#BBD69D]' : 'bg-[#F5F0E5]';

  return (
    <div className={`min-h-screen flex flex-col ${appBgColor} text-[#1E2229]`}>
      {!isFullScreenPage && <Header navigateTo={navigateTo} currentPage={currentPage} />}
      <main
        className={`flex-grow flex flex-col ${
          isFullScreenPage
            ? 'h-full'
            : 'container mx-auto px-2 sm:px-4 py-4 sm:py-8'
        }`}
      >
        {currentPage === 'welcome' && (
          <WelcomePage 
            onStartExploring={navigateToChatFromWelcome}
            menuLoadingError={menuLoadingError} // For displaying initial load errors
            isMenuLoading={isMenuLoading} // For disabling start button if menu not ready
          />
        )}
        {currentPage === 'chat' && !isMenuLoading && activeMenuItems.length > 0 && (
          <ChatPage
            menuItems={activeMenuItems} 
            navigateTo={navigateTo}
            orderItems={orderItems}
            onAddItemToOrder={(item, quantity, notes) => handleAddItemToOrder(item, quantity, notes)} 
            onUpdateOrderItemQuantity={handleUpdateOrderItemQuantity}
            onRemoveOrderItem={handleRemoveOrderItem}
            onMultiItemOrder={handleMultiItemOrder}
            onMultiItemRemoval={handleMultiItemRemoval}
            onCheckoutAndGoToBill={handleCheckoutAndGoToBill}
            parsePrice={parsePrice}
            formatPrice={(val) => typeof val === 'number' ? formatPrice(val) : val}
            calculateOrderTotal={calculateSubtotal}
            getItemNameWithPieces={getItemNameWithPieces} 
          />
        )}
        {currentPage === 'chat' && (isMenuLoading || activeMenuItems.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full">
                {isMenuLoading && <p className="text-lg text-[#475424]">Loading menu, please wait...</p>}
                {!isMenuLoading && menuLoadingError && <p className="text-lg text-red-600">{menuLoadingError}</p>}
                {!isMenuLoading && activeMenuItems.length === 0 && !menuLoadingError && <p className="text-lg text-[#475424]">Menu not available. Please check configuration.</p>}
            </div>
        )}
        {currentPage === 'bill' && currentBillData && (
          <BillPage
            orderData={currentBillData}
            onConfirmAndProceed={handleConfirmOrderAndGoToFinalConfirmation}
            navigateToChat={() => navigateTo('chat')}
            getItemNameWithPieces={getItemNameWithPiecesForBill} 
          />
        )}
        {currentPage === 'finalConfirmation' && (
          <OrderConfirmPage
            orderData={currentBillData} 
            onStartNewOrder={handleStartNewOrderFromFinalConfirmation}
            getItemNameWithPieces={getItemNameWithPiecesForBill} 
          />
        )}
      </main>
      {!isFullScreenPage && <Footer />}
    </div>
  );
};

export default App;
