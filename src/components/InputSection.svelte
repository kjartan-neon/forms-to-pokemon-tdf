<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CsvFormat } from '../utils/csvUtils';
  import type { XlsxParseResult } from '../utils/xlsxUtils';
  
  export let csvInput: string;
  export let error: string;
  export let isLoading: boolean;
  export let dataCount: number;
  export let selectedFormat: CsvFormat;
  
  let selectedInputType: 'csv' | 'xlsx' = 'csv';
  let fileInput: HTMLInputElement;
  
  const dispatch = createEventDispatcher<{
    csvChange: string;
    xlsxUpload: File;
    clear: void;
    formatChange: CsvFormat;
    inputTypeChange: 'csv' | 'xlsx';
  }>();
  
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    dispatch('csvChange', target.value);
  }
  
  function handleClear() {
    dispatch('clear');
  }
  
  function handleFormatChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('formatChange', target.value as CsvFormat);
  }
  
  function handleInputTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedInputType = target.value as 'csv' | 'xlsx';
    dispatch('inputTypeChange', selectedInputType);
    
    // Clear existing data when switching input types
    dispatch('clear');
  }
  
  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        // Reset file input
        target.value = '';
        return;
      }
      dispatch('xlsxUpload', file);
    }
  }
  
  function triggerFileUpload() {
    fileInput?.click();
  }
  
  $: rowCount = csvInput.split('\n').filter(line => line.trim()).length - 1; // Subtract header
  $: charCount = csvInput.length;
  
  $: placeholderText = selectedFormat === 'wix' 
    ? `Order number	Order date	Guest first name	Guest last name	Email	Ticket type	Ticket number	Ticket price	Benefit	Coupon	Tax	Total ticket price	Wix service fee	Ticket revenue	Payment status	Checked in	Seat Information	Player ID	Birthday
2XN9-6KQT-2F7	2025-04-23 19:00:35	John	Doe	john.doe@example.com	League Cup TCG Master	2XN9-6KQT-2F71P	100 kr			0 kr	102.50 kr	2.50 kr	100 kr	Paid	Yes		1234567	1990-01-15`
    : `Timestamp,Email Address,Navn,Player-ID,Fødselsår,Mobil (Brukes kun ved viktige beskjeder)
7/7/2025 14:23:05,john.doe@example.com,John Doe,1234567,1990,12345678`;
</script>

<div class="card p-8">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center">
      <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg mr-3 flex items-center justify-center">
        <span class="text-white text-sm">{selectedInputType === 'xlsx' ? '📁' : '📊'}</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">{selectedInputType === 'xlsx' ? 'XLSX File Upload' : 'CSV Input'}</h2>
    </div>
    {#if csvInput || dataCount > 0}
      <button 
        class="btn-secondary text-sm"
        on:click={handleClear}
      >
        Clear
      </button>
    {/if}
  </div>
  
  <div class="mb-6">
    <label class="block text-lg font-semibold text-gray-800 mb-4">Choose Input Method</label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 {selectedInputType === 'csv' ? 'border-primary-500 bg-primary-50 shadow-lg' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'}">
        <input
          type="radio"
          name="inputType"
          value="csv"
          checked={selectedInputType === 'csv'}
          on:change={handleInputTypeChange}
          class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500 mr-4 mt-1"
        />
        <div>
          <span class="text-base font-semibold {selectedInputType === 'csv' ? 'text-primary-800' : 'text-gray-700'}">📊 Paste CSV Text</span>
          <p class="text-sm text-gray-600 mt-1">Copy and paste CSV data directly</p>
        </div>
      </label>
      <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 {selectedInputType === 'xlsx' ? 'border-primary-500 bg-primary-50 shadow-lg' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'}">
        <input
          type="radio"
          name="inputType"
          value="xlsx"
          checked={selectedInputType === 'xlsx'}
          on:change={handleInputTypeChange}
          class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500 mr-4 mt-1"
        />
        <div>
          <span class="text-base font-semibold {selectedInputType === 'xlsx' ? 'text-primary-800' : 'text-gray-700'}">📁 Upload SPOND XLSX File</span>
          <p class="text-sm text-gray-600 mt-1">Upload original Excel file directly</p>
        </div>
      </label>
    </div>
  </div>
  
  {#if selectedInputType === 'xlsx'}
    <div class="mb-4">
      <label class="block text-lg font-semibold text-gray-800 mb-3">
        Upload your SPOND XLSX file:
      </label>
      <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors duration-300">
        <input
          bind:this={fileInput}
          type="file"
          accept=".xlsx"
          on:change={handleFileUpload}
          class="hidden"
        />
        <button
          type="button"
          class="btn-primary mb-3"
          on:click={triggerFileUpload}
        >
          Choose XLSX File
        </button>
        <p class="text-gray-600 text-sm">
          Select your Excel file exported from the registration system
        </p>
      </div>
    </div>
  {:else}
  <div class="mb-6">
    <label class="block text-lg font-semibold text-gray-800 mb-4">Choose CSV Format</label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 {selectedFormat === 'norwegian' ? 'border-primary-500 bg-primary-50 shadow-lg' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'}">
        <input
          type="radio"
          name="csvFormat"
          value="norwegian"
          checked={selectedFormat === 'norwegian'}
          on:change={handleFormatChange}
          class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500 mr-4 mt-1"
        />
        <div>
          <span class="text-base font-semibold {selectedFormat === 'norwegian' ? 'text-primary-800' : 'text-gray-700'}">Norwegian Registration CSV</span>
          <p class="text-sm text-gray-600 mt-1">Google Forms export format with Norwegian headers</p>
        </div>
      </label>
      <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 {selectedFormat === 'wix' ? 'border-primary-500 bg-primary-50 shadow-lg' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'}">
        <input
          type="radio"
          name="csvFormat"
          value="wix"
          checked={selectedFormat === 'wix'}
          on:change={handleFormatChange}
          class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500 mr-4 mt-1"
        />
        <div>
          <span class="text-base font-semibold {selectedFormat === 'wix' ? 'text-primary-800' : 'text-gray-700'}">Wix Event CSV</span>
          <p class="text-sm text-gray-600 mt-1">Wix Events export format with order details</p>
        </div>
      </label>
    </div>
  </div>
  
  <div class="mb-4">
    <label for="csv-input" class="block text-lg font-semibold text-gray-800 mb-3">
      Paste your CSV data below:
    </label>
    <textarea
      id="csv-input"
      class="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm transition-all duration-300 hover:border-primary-300"
      placeholder={placeholderText}
      bind:value={csvInput}
      on:input={handleInput}
    ></textarea>
  </div>
  {/if}
  
  <div class="flex items-center justify-between text-sm text-gray-600">
    <div class="flex items-center space-x-4">
      {#if selectedInputType === 'csv'}
      <div class="bg-gray-100 px-3 py-1 rounded-full">
        <span class="font-medium">{charCount}</span> characters
      </div>
      <div class="bg-gray-100 px-3 py-1 rounded-full">
        <span class="font-medium">{rowCount}</span> rows
      </div>
      {/if}
      {#if dataCount > 0}
        <div class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
          <span class="font-semibold">{dataCount}</span> players parsed ✅
        </div>
      {/if}
    </div>
    
    {#if isLoading}
      <div class="flex items-center space-x-2">
        <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-primary-600 font-medium">Parsing...</span>
      </div>
    {/if}
  </div>
  
  {#if error}
    <div class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
      <div class="flex items-center">
        <div class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">!</div>
        <p class="text-red-700 font-semibold">Error: {error}</p>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>