<script lang="ts">
  import { parseCsv, type PlayerData, type CsvFormat } from '../utils/csvUtils';
  import { parseXlsxFile, type XlsxParseResult } from '../utils/xlsxUtils';
  import type { TournamentConfig } from '../utils/xmlGenerator';
  import PlayerTable from './PlayerTable.svelte';
  import InputSection from './InputSection.svelte';
  import TournamentConfig from './TournamentConfig.svelte';
  import XmlOutput from './XmlOutput.svelte';
  
  let csvInput = '';
  let parsedData: PlayerData[] = [];
  let error = '';
  let isLoading = false;
  let selectedFormat: CsvFormat = 'norwegian';
  let selectedInputType: 'csv' | 'xlsx' = 'csv';
  let xlsxResult: XlsxParseResult | null = null;
  
  let tournamentConfig: TournamentConfig = {
    organizerName: '',
    organizerPopId: '',
    tournamentName: 'My Scrambleswitch.com Pokemon Challenge',
    city: 'Update',
    startDate: new Date().toISOString().split('T')[0]
  };
  
  function handleCsvChange(event: CustomEvent<string>) {
    csvInput = event.detail;
    if (selectedInputType === 'csv') {
      parseData();
    }
  }
  
  function handleXlsxUpload(event: CustomEvent<File>) {
    const file = event.detail;
    parseXlsxData(file);
  }
  
  function handleClear() {
    csvInput = '';
    parsedData = [];
    xlsxResult = null;
    error = '';
  }
  
  function handleConfigChange(event: CustomEvent<TournamentConfig>) {
    tournamentConfig = event.detail;
  }
  
  function handleFormatChange(event: CustomEvent<CsvFormat>) {
    selectedFormat = event.detail;
    if (selectedInputType === 'csv') {
      parseData(); // Re-parse with new format
    }
  }
  
  function handleInputTypeChange(event: CustomEvent<'csv' | 'xlsx'>) {
    selectedInputType = event.detail;
    // Clear data when switching input types
    handleClear();
  }
  
  async function parseData() {
    if (!csvInput.trim()) {
      parsedData = [];
      error = '';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      // Simulate async parsing for smooth UX
      await new Promise(resolve => setTimeout(resolve, 100));
      parsedData = parseCsv(csvInput, selectedFormat);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid CSV format';
      parsedData = [];
    } finally {
      isLoading = false;
    }
  }
  
  async function parseXlsxData(file: File) {
    isLoading = true;
    error = '';
    
    try {
      xlsxResult = await parseXlsxFile(file);
      parsedData = xlsxResult.players;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to parse XLSX file';
      parsedData = [];
      xlsxResult = null;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-8">
  <InputSection 
    {csvInput} 
    {error} 
    {isLoading}
    {selectedFormat}
    {selectedInputType}
    dataCount={parsedData.length}
    on:csvChange={handleCsvChange}
    on:xlsxUpload={handleXlsxUpload}
    on:clear={handleClear}
    on:formatChange={handleFormatChange}
    on:inputTypeChange={handleInputTypeChange}
  />
  
  <TournamentConfig
    bind:organizerName={tournamentConfig.organizerName}
    bind:organizerPopId={tournamentConfig.organizerPopId}
    bind:tournamentName={tournamentConfig.tournamentName}
    bind:city={tournamentConfig.city}
    bind:startDate={tournamentConfig.startDate}
    players={parsedData}
    on:configChange={handleConfigChange}
  />
  
  {#if parsedData.length > 0}
    <PlayerTable data={parsedData} format={selectedFormat} />
    <XmlOutput players={parsedData} config={tournamentConfig} />
    
    {#if xlsxResult}
      <div class="card p-6">
        <div class="flex items-center mb-4">
          <span class="text-2xl mr-3">📊</span>
          <h3 class="text-xl font-bold text-gray-900">XLSX Parse Summary</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="bg-primary-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-primary-700">{xlsxResult.sections.deltar}</div>
            <div class="text-sm text-primary-600">Deltar</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-gray-700">{xlsxResult.sections.venteliste}</div>
            <div class="text-sm text-gray-600">Venteliste</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-gray-700">{xlsxResult.sections.ikkeSvart}</div>
            <div class="text-sm text-gray-600">Ikke svart</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-gray-700">{xlsxResult.sections.kommerIkke}</div>
            <div class="text-sm text-gray-600">Kommer ikke</div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-primary-100 rounded-lg">
          <p class="text-primary-800 text-sm">
            <span class="font-semibold">{xlsxResult.totalFound} players</span> successfully parsed from the "Deltar" section
          </p>
        </div>
      </div>
    {/if}
  {/if}
</div>