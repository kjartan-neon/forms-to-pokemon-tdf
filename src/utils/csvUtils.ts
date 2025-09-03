export interface PlayerData {
  timestamp: string;
  email: string;
  navn: string;
  playerId: string;
  birthYear: string;
  mobile: string;
}

export type CsvFormat = 'norwegian' | 'wix';

export function parseCsv(csvText: string, format: CsvFormat = 'norwegian'): PlayerData[] {
  if (format === 'wix') {
    return parseWixCsv(csvText);
  }
  return parseNorwegianCsv(csvText);
}

function parseWixCsv(csvText: string): PlayerData[] {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }
  
  const header = lines[0];
  const expectedHeaders = [
    'Order number',
    'Order date', 
    'Guest first name',
    'Guest last name',
    'Email',
    'Player ID',
    'Birthday'
  ];
  
  // Basic header validation
  if (!header.includes('Order date') || !header.includes('Email') || !header.includes('Player ID')) {
    throw new Error('CSV header does not match expected Wix format. Please ensure it contains Order date, Email, and Player ID columns. Have you tried to select Google Forms format?');
  }
  
  const dataRows = lines.slice(1).filter(line => line.trim());
  const players: PlayerData[] = [];
  const playerMap = new Map<string, PlayerData>();
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const columns = row.split('\t'); // Use tab separator for Wix format
    
    if (columns.length < 19) {
      throw new Error(`Row ${i + 2} does not have enough columns. Expected at least 19, got ${columns.length}`);
    }
    
    const firstName = columns[2]?.trim() || '';
    const lastName = columns[3]?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const birthday = columns[18]?.trim() || '';
    const birthYear = birthday ? birthday.split('-')[0] : '';
    
    const player: PlayerData = {
      timestamp: columns[1]?.trim() || '', // Order date
      email: columns[4]?.trim() || '', // Email
      navn: fullName,
      playerId: columns[17]?.trim() || '', // Player ID
      birthYear: birthYear,
      mobile: '' // Not available in Wix format
    };
    
    // Basic validation
    if (!player.email.includes('@')) {
      throw new Error(`Row ${i + 2}: Invalid email address "${player.email}"`);
    }
    
    if (!player.navn) {
      throw new Error(`Row ${i + 2}: Name is required`);
    }
    
    if (!player.playerId) {
      throw new Error(`Row ${i + 2}: Player ID is required`);
    }
    
    // Check for duplicates and keep the most recent entry
    const existingPlayer = playerMap.get(player.playerId);
    if (!existingPlayer || isMoreRecent(player.timestamp, existingPlayer.timestamp)) {
      playerMap.set(player.playerId, player);
    }
  }
  
  return Array.from(playerMap.values());
}

function parseNorwegianCsv(csvText: string): PlayerData[] {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }
  
  const header = lines[0];
  const expectedHeaders = [
    'Timestamp',
    'Email Address', 
    'Navn',
    'Player-ID',
    'Fødselsår',
    'Mobil (Brukes kun ved viktige beskjeder)'
  ];
  
  // Basic header validation
  if (!header.includes('Timestamp') || !header.includes('Email Address') || !header.includes('Navn')) {
    throw new Error('CSV header does not match expected format. Please ensure it contains Timestamp, Email Address, and Navn columns. Have you tried selecting WIX format at the top?');
  }
  
  const dataRows = lines.slice(1).filter(line => line.trim());
  const players: PlayerData[] = [];
  const playerMap = new Map<string, PlayerData>();
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const columns = parseCSVRow(row);
    
    if (columns.length < 5) {
      throw new Error(`Row ${i + 2} does not have enough columns. Expected at least 5, got ${columns.length}`);
    }
    
    const player: PlayerData = {
      timestamp: columns[0]?.trim() || '',
      email: columns[1]?.trim() || '',
      navn: columns[2]?.trim() || '',
      playerId: columns[3]?.trim() || '',
      birthYear: columns[4]?.trim() || '',
      mobile: columns[5]?.trim() || ''
    };
    
    // Basic validation
    if (!player.email.includes('@')) {
      throw new Error(`Row ${i + 2}: Invalid email address "${player.email}"`);
    }
    
    if (!player.navn) {
      throw new Error(`Row ${i + 2}: Name (Navn) is required`);
    }
    
    if (!player.playerId) {
      throw new Error(`Row ${i + 2}: Player ID is required`);
    }
    
    // Check for duplicates and keep the most recent entry
    const existingPlayer = playerMap.get(player.playerId);
    if (!existingPlayer || isMoreRecent(player.timestamp, existingPlayer.timestamp)) {
      playerMap.set(player.playerId, player);
    }
  }
  
  return Array.from(playerMap.values());
}

function isMoreRecent(timestamp1: string, timestamp2: string): boolean {
  try {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getTime() > date2.getTime();
  } catch {
    // If date parsing fails, assume the first one is more recent
    return true;
  }
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}