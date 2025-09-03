import type { PlayerData } from './csvUtils';

export interface TournamentConfig {
  organizerName: string;
  organizerPopId: string;
  tournamentName?: string;
  city?: string;
  startDate?: string;
}

export function generateTdfXml(players: PlayerData[], config: TournamentConfig): string {
  const currentDate = new Date();
  const formattedDate = formatDateForXml(currentDate);
  const startDate = config.startDate || formatDateForXml(currentDate);
  
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
  
  const tournamentData = `
<tournament type="2" stage="1" version="1.74" gametype="TRADING_CARD_GAME" mode="LEAGUECHALLENGE">
	<data>
		<name>${escapeXml(config.tournamentName || 'August Challenge')}</name>
		<id></id>
		<city>${escapeXml(config.city || 'Update')}</city>
		<state></state>
		<country>Norway</country>
		<roundtime>0</roundtime>
		<finalsroundtime>0</finalsroundtime>
		<organizer popid="${escapeXml(config.organizerPopId)}" name="${escapeXml(config.organizerName)}"/>
		<startdate>${startDate}</startdate>
		<lessswiss>false</lessswiss>
		<autotablenumber>true</autotablenumber>
		<overflowtablestart>0</overflowtablestart>
	</data>
	<timeelapsed>0</timeelapsed>
	<players>`;

  const playersXml = players.map(player => {
    const names = splitName(player.navn);
    const birthDate = formatBirthDate(player.birthYear);
    
    return `		<player userid="${escapeXml(player.playerId)}">
			<firstname>${escapeXml(names.firstName)}</firstname>
			<lastname>${escapeXml(names.lastName)}</lastname>
			<birthdate>${birthDate}</birthdate>
			<creationdate>${formattedDate}</creationdate>
			<lastmodifieddate>${formattedDate}</lastmodifieddate>
		</player>`;
  }).join('\n');

  const xmlFooter = `
	</players>
	<pods>
	</pods>
	<finalsoptions>
	</finalsoptions>
</tournament>`;

  return xmlHeader + tournamentData + '\n' + playersXml + xmlFooter;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

function formatBirthDate(birthYear: string): string {
  // Handle full date format (YYYY-MM-DD), DD/MM/YYYY, or just year
  if (birthYear.includes('-')) {
    // Full date format from Wix (YYYY-MM-DD)
    const [year, month, day] = birthYear.split('-');
    return `${month}/${day}/${year}`;
  } else if (birthYear.includes('/')) {
    // DD/MM/YYYY format from XLSX
    const parts = birthYear.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${month}/${day}/${year}`;
    }
  } else {
    // Just year format from Norwegian CSV
    return `02/27/${birthYear}`;
  }
  
  return birthYear;
}

function formatDateForXml(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}