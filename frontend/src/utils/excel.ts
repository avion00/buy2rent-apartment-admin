import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  rows: any[];
  headers: string[];
}

export const parseXlsx = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 50; // 50% for reading
        onProgress(percentComplete);
      }
    };
    
    reader.onload = (e) => {
      try {
        if (onProgress) onProgress(50); // Reading complete
        
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (onProgress) onProgress(60); // Sheet loaded
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('Empty spreadsheet'));
          return;
        }
        
        if (onProgress) onProgress(70); // Data converted
        
        // Filter headers - remove empty columns
        const headerRow = jsonData[0] as any[];
        const validColumnIndices = headerRow
          .map((h, idx) => ({ header: String(h || '').trim(), idx }))
          .filter(({ header }) => header !== '');
        
        const headers = validColumnIndices.map(({ header }) => header);
        
        if (onProgress) onProgress(80); // Headers processed
        
        // Filter out completely empty rows and map to objects
        const rows = jsonData.slice(1)
          .filter((row: any) => {
            // Check if row has any non-empty value
            return row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '');
          })
          .map((row: any, idx) => {
            const obj: any = {};
            validColumnIndices.forEach(({ header, idx: colIdx }) => {
              const value = row[colIdx];
              // Only include non-empty values
              if (value !== null && value !== undefined && String(value).trim() !== '') {
                obj[header] = value;
              }
            });
            
            // Progress update for row processing (80-100%)
            if (onProgress && idx % 10 === 0) {
              const progress = 80 + ((idx / jsonData.length) * 20);
              onProgress(Math.min(progress, 100));
            }
            
            return obj;
          })
          .filter(obj => Object.keys(obj).length > 0); // Remove rows with no data
        
        if (onProgress) onProgress(100); // Complete
        
        resolve({ rows, headers });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const autoMapColumns = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  const patterns: Record<string, string[]> = {
    apartment: ['apartment', 'apt', 'project', 'location'],
    product: ['product', 'item', 'name', 'title'],
    vendor: ['vendor', 'supplier', 'brand'],
    vendorLink: ['link', 'url', 'vendor link', 'supplier link'],
    sku: ['sku', 'code', 'item code', 'product code'],
    unitPrice: ['price', 'unit price', 'cost', 'amount'],
    qty: ['qty', 'quantity', 'count', 'amount'],
    category: ['category', 'type', 'group'],
    room: ['room', 'space', 'area'],
    availability: ['availability', 'stock', 'in stock'],
    status: ['status', 'state', 'order status'],
    eta: ['eta', 'delivery', 'expected', 'arrival'],
    imageUrl: ['image', 'photo', 'picture', 'img'],
    replacementOf: ['replacement', 'replaces', 'replacement of'],
    notes: ['notes', 'comments', 'remarks'],
  };
  
  headers.forEach((header) => {
    const normalized = (header || '').toLowerCase().trim();
    
    for (const [field, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        mapping[header] = field;
        break;
      }
    }
    
    if (!mapping[header]) {
      mapping[header] = 'skip';
    }
  });
  
  return mapping;
};

export const validateProductRow = (
  row: any,
  mapping: Record<string, string>,
  apartments: Array<{ id: string; name: string }>
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const getValue = (field: string) => {
    const header = Object.keys(mapping).find(k => mapping[k] === field);
    return header ? row[header] : undefined;
  };
  
  // Required fields
  const requiredFields = ['product', 'vendor', 'vendorLink', 'sku', 'unitPrice', 'qty', 'apartment'];
  
  requiredFields.forEach(field => {
    const value = getValue(field);
    if (!value || String(value).trim() === '') {
      errors.push(`Missing ${field}`);
    }
  });
  
  // Validate apartment
  const apartmentValue = getValue('apartment');
  if (apartmentValue) {
    const aptExists = apartments.some(
      a => a.id === apartmentValue || (a.name || '').toLowerCase() === String(apartmentValue || '').toLowerCase()
    );
    if (!aptExists) {
      errors.push('Apartment not found');
    }
  }
  
  // Validate price
  const price = getValue('unitPrice');
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    errors.push('Invalid unit price');
  } else if (Number(price) === 0) {
    warnings.push('Price is 0');
  }
  
  // Validate qty
  const qty = getValue('qty');
  if (qty !== undefined && (isNaN(Number(qty)) || Number(qty) < 0)) {
    errors.push('Invalid quantity');
  } else if (Number(qty) === 0) {
    warnings.push('Quantity is 0');
  }
  
  // Validate URL
  const url = getValue('vendorLink');
  if (url) {
    try {
      new URL(String(url));
    } catch {
      warnings.push('Invalid URL format');
    }
  }
  
  // Validate ETA
  const eta = getValue('eta');
  if (eta && eta !== '') {
    const date = new Date(eta);
    if (isNaN(date.getTime())) {
      errors.push('Invalid ETA date');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
