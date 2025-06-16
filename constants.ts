import { MenuItem, TasteProfileOption } from './types';

export const TASTE_PROFILE_OPTIONS: TasteProfileOption[] = [
  { value: 'Spicy', label: 'Spicy', emoji: '🌶️' },
  { value: 'Sweet', label: 'Sweet', emoji: '🍬' },
  { value: 'Savory', label: 'Savory', emoji: '🍲' },
  { value: 'Sour', label: 'Sour', emoji: '🍋' },
  { value: 'Buttery', label: 'Buttery', emoji: '🥬' },
  { value: 'Fragrant', label: 'Fragrant', emoji: '🍄' },
  { value: 'Rich', label: 'Rich', emoji: '🧀' },
  { value: 'Light', label: 'Light', emoji: '🥗' },
  { value: 'refreshing', label: 'Refresh', emoji: '🌿' },
  { value: 'Smoky', label: 'Smoky', emoji: '💨' },
  { value: 'Fruity', label: 'Fruity', emoji: '🍓' },
  { value: 'Crispy', label: 'Crispy', emoji: '🪴' },
  { value: 'Tangy', label: 'Tangy', emoji: '🍊' },
  { value: 'Creamy', label: 'Creamy', emoji: '🍦' },
  { value: 'Juicy', label: 'Juicy', emoji: '🌿' },
  { value: 'Mild', label: 'Mild', emoji: '💨' },
  { value: 'Fluffy', label: 'Fluffy', emoji: '🍓' },
  { value: 'Toasty', label: 'Toasty', emoji: '🪴' },
  { value: 'Nutty', label: 'Nutty', emoji: '🍊' },
  { value: 'Zesty', label: 'Zesty', emoji: '🍦' },
  { value: 'Crumbly', label: 'Crumbly', emoji: '🥔'}
];

// Expected Excel Column Headers for `menu.xlsx` (case-insensitive for parsing, but these are canonical).
// The parser will look for these headers in the first row of the `menu.xlsx` file.
export const EXPECTED_EXCEL_HEADERS = [
  'ID', 
  'Name', 
  'Description', 
  'ImageURL', 
  'Category', // Must be one of: 'Appetizer', 'Main Course', 'Dessert', 'Drink', 'Side'
  'TasteProfiles', // Comma-separated, e.g., "Fresh,Light,Tangy"
  'Price', // e.g., "₹8.50" or "8.50" (will be standardized)
  'Pieces' // Optional, number, e.g., 2
];

// The DEFAULT_MENU_ITEMS array below serves as a *fallback*. 
// It is used if the `menu.xlsx` file (expected in the project's root directory) cannot be fetched, 
// is empty, invalid, or if the menu loaded from `localStorage` is invalid. 
// The primary method for populating the menu is by providing a valid `menu.xlsx` file 
// within the application's codebase.
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes cooked in a rich tomato-butter gravy",
    category: "Main Course",
    tasteProfiles: ["Spicy", "Rich", "Buttery"],
    price: "₹180.00",
    image: "https://example.com/images/paneer_butter_masala.jpg"
  },
  {
    id: "2",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice layered with spiced chicken",
    category: "Main Course",
    tasteProfiles: ["Spicy", "Fragrant", "Savory"],
    price: "₹220.00",
    image: "https://example.com/images/chicken_biryani.jpg"
  },
  {
    id: "3",
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spicy mashed potatoes",
    category: "Main Course",
    tasteProfiles: ["Crispy", "Spicy", "Tangy"],
    price: "₹90.00",
    pieces: 1,
    image: "https://example.com/images/masala_dosa.jpg"
  },
  {
    id: "4",
    name: "Gulab Jamun",
    description: "Deep-fried milk solids soaked in rose-flavored sugar syrup",
    category: "Dessert",
    tasteProfiles: ["Sweet", "Juicy", "Rich"],
    price: "₹60.00",
    pieces: 2,
    image: "https://example.com/images/gulab_jamun.jpg"
  },
  {
    id: "5",
    name: "Mango Lassi",
    description: "Sweet mango yogurt smoothie served chilled",
    category: "Drink",
    tasteProfiles: ["Sweet", "Creamy", "Fruity"],
    price: "₹70.00",
    image: "https://example.com/images/mango_lassi.jpg"
  },
  {
    id: "6",
    name: "Tandoori Chicken",
    description: "Char-grilled chicken marinated in yogurt and spices",
    category: "Main Course",
    tasteProfiles: ["Smoky", "Spicy", "Tangy"],
    price: "₹200.00",
    pieces: 4,
    image: "https://example.com/images/tandoori_chicken.jpg"
  },
  {
    id: "7",
    name: "Samosa",
    description: "Crispy pastry filled with spicy potatoes and peas",
    category: "Appetizer",
    tasteProfiles: ["Spicy", "Crispy", "Earthy"],
    price: "₹15.00",
    pieces: 1,
    image: "https://example.com/images/samosa.jpg"
  },
  {
    id: "8",
    name: "Butter Naan",
    description: "Soft leavened bread brushed with butter",
    category: "Main Course", // Assuming Naan is part of a Main Course offering
    tasteProfiles: ["Buttery", "Soft", "Mild"],
    price: "₹30.00",
    pieces: 1,
    image: "https://example.com/images/butter_naan.jpg"
  },
  {
    id: "9",
    name: "Rajma Chawal",
    description: "Kidney beans curry served with steamed rice",
    category: "Main Course",
    tasteProfiles: ["Spicy", "Earthy", "Comforting"],
    price: "₹120.00",
    image: "https://example.com/images/rajma_chawal.jpg"
  },
  {
    id: "10",
    name: "Aloo Tikki",
    description: "Spiced potato patties, crispy and golden brown",
    category: "Appetizer",
    tasteProfiles: ["Spicy", "Crispy", "Savory"],
    price: "₹40.00",
    pieces: 2,
    image: "https://example.com/images/aloo_tikki.jpg"
  },
  {
    id: "11",
    name: "Pani Puri",
    description: "Crispy puris filled with spicy and tangy flavored water",
    category: "Appetizer",
    tasteProfiles: ["Tangy", "Spicy", "Crunchy"],
    price: "₹50.00",
    pieces: 6,
    image: "https://example.com/images/pani_puri.jpg"
  },
  {
    id: "12",
    name: "Palak Paneer",
    description: "Cottage cheese cooked in a spinach gravy",
    category: "Main Course",
    tasteProfiles: ["Mild", "Creamy", "Earthy"],
    price: "₹160.00",
    image: "https://example.com/images/palak_paneer.jpg"
  },
  {
    id: "13",
    name: "Chole Bhature",
    description: "Spicy chickpeas served with deep-fried bread",
    category: "Main Course",
    tasteProfiles: ["Spicy", "Fluffy", "Savory"],
    price: "₹100.00",
    pieces: 2,
    image: "https://example.com/images/chole_bhature.jpg"
  },
  {
    id: "14",
    name: "Veg Pulao",
    description: "Fragrant basmati rice with mixed vegetables and spices",
    category: "Main Course",
    tasteProfiles: ["Fragrant", "Mild", "Savory"],
    price: "₹110.00",
    image: "https://example.com/images/veg_pulao.jpg"
  },
  {
    id: "15",
    name: "Rasgulla",
    description: "Soft and spongy white cheese balls in sugar syrup",
    category: "Dessert",
    tasteProfiles: ["Sweet", "Juicy", "Light"],
    price: "₹50.00",
    pieces: 2,
    image: "https://example.com/images/rasgulla.jpg"
  },
  {
    id: "16",
    name: "Jeera Rice",
    description: "Steamed basmati rice flavored with cumin",
    category: "Main Course", // Could be a Side, but Main Course if it's a primary rice dish option
    tasteProfiles: ["Fragrant", "Mild", "Toasty"],
    price: "₹70.00",
    image: "https://example.com/images/jeera_rice.jpg"
  },
  {
    id: "17",
    name: "Bhindi Masala",
    description: "Okra stir-fried with spices",
    category: "Main Course", // Or 'Side' if it's an accompaniment
    tasteProfiles: ["Savory", "Spicy", "Earthy"],
    price: "₹140.00",
    image: "https://example.com/images/bhindi_masala.jpg"
  },
  {
    id: "18",
    name: "Chai",
    description: "Indian spiced tea made with milk and sugar",
    category: "Drink",
    tasteProfiles: ["Spiced", "Sweet", "Creamy"],
    price: "₹20.00",
    image: "https://example.com/images/chai.jpg"
  },
  {
    id: "19",
    name: "Rava Idli",
    description: "Steamed semolina cakes served with chutney",
    category: "Main Course", // Often a breakfast/light meal
    tasteProfiles: ["Mild", "Spongy", "Nutty"],
    price: "₹60.00",
    pieces: 3,
    image: "https://example.com/images/rava_idli.jpg"
  },
  {
    id: "20",
    name: "Mysore Pak",
    description: "Traditional sweet made with gram flour and ghee",
    category: "Dessert",
    tasteProfiles: ["Sweet", "Crumbly", "Rich"],
    price: "₹70.00",
    pieces: 2,
    image: "https://example.com/images/mysore_pak.jpg"
  },
  {
    id: "21",
    name: "Veg Momos",
    description: "Steamed dumplings stuffed with vegetables",
    category: "Appetizer",
    tasteProfiles: ["Spicy", "Juicy", "Savory"],
    price: "₹80.00",
    pieces: 6,
    image: "https://example.com/images/veg_momos.jpg"
  },
  {
    id: "22",
    name: "Fruit Chaat",
    description: "Mixed fruits seasoned with spices",
    category: "Appetizer", // Or 'Dessert' or 'Side' depending on context
    tasteProfiles: ["Tangy", "Sweet", "Refreshing"],
    price: "₹60.00",
    image: "https://example.com/images/fruit_chaat.jpg"
  },
  {
    id: "23",
    name: "Kadhai Paneer",
    description: "Paneer cooked in a spicy tomato and bell pepper gravy",
    category: "Main Course",
    tasteProfiles: ["Spicy", "Zesty", "Rich"],
    price: "₹170.00",
    image: "https://example.com/images/kadhai_paneer.jpg"
  },
  {
    id: "24",
    name: "Sweet Lassi",
    description: "Traditional sweetened yogurt drink",
    category: "Drink",
    tasteProfiles: ["Sweet", "Creamy", "Refreshing"],
    price: "₹50.00",
    image: "https://example.com/images/sweet_lassi.jpg"
  },
  {
    id: "25",
    name: "Papdi Chaat",
    description: "Crispy papdi with yogurt, chutneys, and spices",
    category: "Appetizer",
    tasteProfiles: ["Tangy", "Spicy", "Crunchy"],
    price: "₹65.00",
    image: "https://example.com/images/papdi_chaat.jpg"
  }
];


export const MENU_ITEM_CATEGORIES: MenuItem['category'][] = ['Appetizer', 'Main Course', 'Dessert', 'Drink', 'Side'];
export const MENU_ITEM_CATEGORIES_ORDER: MenuItem['category'][] = ['Appetizer', 'Main Course', 'Dessert', 'Drink', 'Side'];


// New Palette (as defined in the original file):
// PALE_GREEN = #BBD69D
// GOLDEN_YELLOW = #EDB403
// DARK_OLIVE_GREEN = #475424
// CREAM = #F5F0E5 (For neutral backgrounds if needed)
// TEXT_COLOR_DARK = #1E2229

export const TASTE_PROFILE_COLORS: Record<string, string> = {
  Spicy: 'bg-[#EDB403] text-[#1E2229] border border-[#EDB403]/80',
  Sweet: 'bg-[#BBD69D] text-[#1E2229] border border-[#BBD69D]/80',
  Savory: 'bg-[#BBD69D]/70 text-[#1E2229] border border-[#BBD69D]',
  Sour: 'bg-[#EDB403] text-[#1E2229] border border-[#EDB403]/80',
  Buttery: 'bg-[#475424] text-[#BBD69D] border border-[#475424]/80',
  Fragrant: 'bg-[#475424]/80 text-[#BBD69D] border border-[#475424]',
  Rich: 'bg-[#EDB403] text-[#1E2229] border border-[#EDB403]/80',
  Light: 'bg-[#F5F0E5] text-[#1E2229] border border-[#BBD69D]',
  Refreshing: 'bg-[#BBD69D] text-[#1E2229] border border-[#BBD69D]/80',
  Smoky: 'bg-[#475424]/60 text-[#BBD69D] border border-[#475424]',
  Fruity: 'bg-[#EDB403]/80 text-[#1E2229] border border-[#EDB403]',
  Crispy: 'bg-[#BBD69D] text-[#1E2229] border border-[#475424]',
  Tangy: 'bg-[#EDB403] text-[#1E2229] border border-[#EDB403]/80',
  Creamy: 'bg-[#F5F0E5] text-[#1E2229] border border-[#BBD69D]',
  Earthy: 'bg-[#475424] text-[#BBD69D] border border-[#EDB403]',
  Juicy: 'bg-[#EDB403] text-[#1E2229] border border-[#EDB403]/80',
  Mild: 'bg-[#BBD69D] text-[#1E2229] border border-[#BBD69D]/80',
  Fluffy: 'bg-[#475424]/60 text-[#BBD69D] border border-[#475424]',
  Toasty: 'bg-[#EDB403]/80 text-[#1E2229] border border-[#EDB403]',
  Nutty: 'bg-[#475424] text-[#BBD69D] border border-[#475424]/80',
  Zesty: 'bg-[#475424]/80 text-[#BBD69D] border border-[#475424]',
  Crumbly: 'bg-[#EDB403]/80 text-[#1E2229] border border-[#EDB403]',
  Default: 'bg-[#BBD69D] text-[#1E2229] border border-[#475424]'
};

export const GST_RATE = 0.05; // 5% GST