import * as XLSX from 'xlsx';
import type { PlayerData } from './csvUtils';

export interface XlsxParseResult {
  players: PlayerData[];
  totalFound: number;
  sections: {
    deltar: number;
    venteliste: number;
    ikkeSvart: number;
    kommerIkke: number;
  };
}

export function parseXlsxFile(file: File): Promise<XlsxParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        }) as string[][];
        
        const result = parseXlsxData(jsonData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function parseXlsxData(data: string[][]): XlsxParseResult {
  const result: XlsxParseResult = {
    players: [],
    totalFound: 0,
    sections: {
      deltar: 0,
      venteliste: 0,
      ikkeSvart: 0,
      kommerIkke: 0
    }
  };
  
  let currentSection = '';
  let headerRowIndex = -1;
  let headerColumns: string[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = row[0]?.toString().trim() || '';
    
    // Detect section headers
    if (firstCell.includes('Deltar (')) {
      currentSection = 'deltar';
      const match = firstCell.match(/Deltar \((\d+)\)/);
      if (match) {
        result.sections.deltar = parseInt(match[1]);
      }
      continue;
    } else if (firstCell.includes('Venteliste (')) {
      currentSection = 'venteliste';
      const match = firstCell.match(/Venteliste \((\d+)\)/);
      if (match) {
        result.sections.venteliste = parseInt(match[1]);
      }
      continue;
    } else if (firstCell.includes('Ikke svart (')) {
      currentSection = 'ikkeSvart';
      const match = firstCell.match(/Ikke svart \((\d+)\)/);
      if (match) {
        result.sections.ikkeSvart = parseInt(match[1]);
      }
      continue;
    } else if (firstCell.includes('Kommer ikke (')) {
      currentSection = 'kommerIkke';
      const match = firstCell.match(/Kommer ikke \((\d+)\)/);
      if (match) {
        result.sections.kommerIkke = parseInt(match[1]);
      }
      continue;
    }
    
    // Detect header row (contains "Navn", "E-post", "Spiller ID", etc.)
    if (firstCell === 'Navn' && row.some(cell => cell?.toString().includes('E-post'))) {
      headerRowIndex = i;
      headerColumns = row.map(cell => cell?.toString().trim() || '');
      continue;
    }
    
    // Skip if we haven't found a header yet or if we're not in the "deltar" section
    if (headerRowIndex === -1 || currentSection !== 'deltar') {
      continue;
    }
    
    // Skip empty rows or rows that don't have a name in the first column
    if (!firstCell || firstCell === '' || row.every(cell => !cell || cell.toString().trim() === '')) {
      continue;
    }
    
    // Parse player data
    const player = parsePlayerRow(row, headerColumns);
    if (player) {
      result.players.push(player);
    }
  }
  
  result.totalFound = result.players.length;
  return result;
}

function parsePlayerRow(row: string[], headers: string[]): PlayerData | null {
  const getValue = (headerName: string): string => {
    const index = headers.findIndex(h => h.includes(headerName));
    return index >= 0 ? (row[index]?.toString().trim() || '') : '';
  };
  
  const navn = getValue('Navn');
  const email = getValue('E-post');
  const playerId = getValue('Spiller ID');
  const birthDate = getValue('Fødselsdato');
  const mobile = getValue('Mobilnummer');
  
  // Skip rows without essential data (name, email, or player ID)
  if (!navn || (!email && !playerId)) {
    return null;
  }
  
  // Skip parent/guardian rows (they typically don't have player IDs)
  if (!playerId && email) {
    return null;
  }
  
  return {
    timestamp: new Date().toISOString(),
    email: email || '',
    navn: navn,
    playerId: playerId || '',
    birthYear: formatBirthDate(birthDate),
    mobile: mobile || ''
  };
}

function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '';
  
  // Handle DD/MM/YYYY format
  if (birthDate.includes('/')) {
    const parts = birthDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Return as YYYY-MM-DD for consistency with existing format
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Handle other formats or return as-is
  return birthDate;
}