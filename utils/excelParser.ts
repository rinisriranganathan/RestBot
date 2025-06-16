import * as XLSX from 'xlsx';
import { MenuItem } from '../types';
import { EXPECTED_EXCEL_HEADERS, MENU_ITEM_CATEGORIES } from '../constants';

const standardizePrice = (price: string | number | undefined): string => {
  if (price === undefined || price === null || String(price).trim() === '') return '₹0.00';
  let priceStr = String(price).replace(/₹/g, '').trim();
  const priceNum = parseFloat(priceStr);
  if (isNaN(priceNum)) return '₹0.00';
  return `₹${priceNum.toFixed(2)}`;
};

const parseTasteProfiles = (profiles: string | undefined): string[] => {
  if (!profiles || typeof profiles !== 'string') return [];
  return profiles.split(',').map(p => p.trim()).filter(p => p.length > 0);
};

const isValidCategory = (category: any): category is MenuItem['category'] => {
  return MENU_ITEM_CATEGORIES.includes(category);
};

export const parseMenuItemsFromExcel = (arrayBuffer: ArrayBuffer): Promise<MenuItem[]> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        reject(new Error("Excel sheet is empty or has no data rows."));
        return;
      }

      const headerRow = (jsonData[0] as string[]).map(h => String(h).trim());
      
      // Headers that are expected and whose presence will be checked (ImageURL is now excluded from this strict check)
      const headersForPresenceCheckLower = EXPECTED_EXCEL_HEADERS
        .map(h => h.toLowerCase())
        .filter(h => h !== 'imageurl'); // Exclude 'imageurl' from the strict presence check

      const actualHeadersLower = headerRow.map(h => h.toLowerCase());

      // Check if all headers (excluding ImageURL for presence) are present
      for (const expectedHeaderStrict of headersForPresenceCheckLower) {
        if (!actualHeadersLower.includes(expectedHeaderStrict)) {
          // Find original casing for the error message
          const originalHeaderName = EXPECTED_EXCEL_HEADERS.find(h => h.toLowerCase() === expectedHeaderStrict) || expectedHeaderStrict;
          reject(new Error(`Missing expected Excel column header: '${originalHeaderName}'. Please ensure the first row contains all required headers like: ${EXPECTED_EXCEL_HEADERS.join(', ')}.`));
          return;
        }
      }
      
      // Create a map of all actual header names (lowercase) found in the file to their column index
      const headerMap: { [key: string]: number } = {};
      actualHeadersLower.forEach((header, index) => {
        headerMap[header] = index;
      });


      const menuItems: MenuItem[] = [];
      const dataRows = jsonData.slice(1); // Skip header row

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i] as any[];
        if (!row || row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
          // Skip empty rows
          continue;
        }

        const id = String(row[headerMap['id'.toLowerCase()]] ?? '').trim();
        const name = String(row[headerMap['name'.toLowerCase()]] ?? '').trim();
        
        // Basic validation: skip row if essential 'id' or 'name' is missing
        if (!id || !name) {
          console.warn(`Skipping row ${i + 2} due to missing ID or Name.`);
          continue; 
        }

        const categoryInput = String(row[headerMap['category'.toLowerCase()]] ?? '').trim() as MenuItem['category'];
        if (!isValidCategory(categoryInput)) {
          console.warn(`Skipping item "${name}" (ID: ${id}) due to invalid category: "${categoryInput}". Must be one of ${MENU_ITEM_CATEGORIES.join(', ')}.`);
          continue;
        }
        
        const menuItem: MenuItem = {
          id,
          name,
          description: String(row[headerMap['description'.toLowerCase()]] ?? '').trim(),
          // ImageURL will use default if header or data is missing, as headerMap['imageurl'] would be undefined if header not present
          image: String(row[headerMap['imageurl'.toLowerCase()]] ?? 'https://picsum.photos/200/200?grayscale').trim(),
          category: categoryInput,
          tasteProfiles: parseTasteProfiles(String(row[headerMap['tasteprofiles'.toLowerCase()]] ?? '')),
          price: standardizePrice(row[headerMap['price'.toLowerCase()]]),
          pieces: row[headerMap['pieces'.toLowerCase()]] !== undefined && !isNaN(parseInt(String(row[headerMap['pieces'.toLowerCase()]]), 10)) ? parseInt(String(row[headerMap['pieces'.toLowerCase()]]), 10) : undefined,
        };
        menuItems.push(menuItem);
      }
      resolve(menuItems);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      reject(error instanceof Error ? error : new Error("An unknown error occurred during Excel parsing."));
    }
  });
};