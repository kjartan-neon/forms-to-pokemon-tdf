<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PlayerData } from '../utils/csvUtils';
  import { generateTdfXml } from '../utils/xmlGenerator';
  
  export let organizerName: string;
  export let organizerPopId: string;
  export let tournamentName: string;
  export let city: string;
  export let startDate: string;
  export let players: PlayerData[] = [];
  
  const dispatch = createEventDispatcher<{
    configChange: {
      organizerName: string;
      organizerPopId: string;
      tournamentName: string;
      city: string;
      startDate: string;
    };
  }>();
  
  function handleChange() {
    dispatch('configChange', {
      organizerName,
      organizerPopId,
      tournamentName,
      city,
      startDate
    });
  }
  
  // Format date for input field (YYYY-MM-DD)
  function formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  
  // Format date for display (MM/DD/YYYY)
  function formatDateForDisplay(inputDate: string): string {
    if (!inputDate) return '';
    try {
      const date = new Date(inputDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return inputDate;
    }
  }
  
  $: canDownload = players.length > 0 && organizerName && organizerPopId;
  
  function downloadTdf() {
    if (!canDownload) return;
    
    const config = {
      organizerName,
      organizerPopId,
      tournamentName,
      city,
      startDate
    };
    
    const xmlContent = generateTdfXml(players, config);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-${Date.now()}.tdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="card p-8">
  <div class="flex items-center justify-between mb-6">
    <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg mr-3 flex items-center justify-center">
      <span class="text-white text-sm">⚙️</span>
    </div>
    <h2 class="text-2xl font-bold text-gray-900">Tournament Configuration</h2>
    {#if canDownload}
      <button
        class="btn-primary flex items-center space-x-2"
        on:click={downloadTdf}
      >
        <span>📄</span>
        <span>Download TDF</span>
      </button>
    {/if}
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label for="organizer-name" class="block text-base font-semibold text-gray-800 mb-3">
        Organizer Name <span class="text-red-500 text-lg">*</span>
      </label>
      <input
        id="organizer-name"
        type="text"
        class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-300"
        placeholder="Enter organizer name"
        bind:value={organizerName}
        on:input={handleChange}
        required
      />
    </div>
    
    <div>
      <label for="organizer-popid" class="block text-base font-semibold text-gray-800 mb-3">
        POP ID <span class="text-red-500 text-lg">*</span>
      </label>
      <input
        id="organizer-popid"
        type="text"
        class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-300"
        placeholder="Enter POP ID"
        bind:value={organizerPopId}
        on:input={handleChange}
        required
      />
    </div>
    
    <div>
      <label for="tournament-name" class="block text-base font-semibold text-gray-800 mb-3">
        Tournament Name
      </label>
      <input
        id="tournament-name"
        type="text"
        class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-300"
        placeholder="August Challenge"
        bind:value={tournamentName}
        on:input={handleChange}
      />
    </div>
    
    <div>
      <label for="city" class="block text-base font-semibold text-gray-800 mb-3">
        City
      </label>
      <input
        id="city"
        type="text"
        class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-300"
        placeholder="Update"
        bind:value={city}
        on:input={handleChange}
      />
    </div>
    
    <div class="md:col-span-2">
      <label for="start-date" class="block text-base font-semibold text-gray-800 mb-3">
        Start Date
      </label>
      <input
        id="start-date"
        type="date"
        class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-300"
        bind:value={startDate}
        on:input={handleChange}
      />
      {#if startDate}
        <p class="text-sm text-gray-600 mt-2">
          Will be formatted as: {formatDateForDisplay(startDate)}
        </p>
      {/if}
    </div>
  </div>
  
  <div class="mt-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
    <div class="flex items-center">
      <div class="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">i</div>
      <p class="text-primary-800 text-sm">
        <span class="font-semibold">Required fields:</span> Organizer Name and POP ID are mandatory for XML generation.<br>
        <span class="font-semibold">Remember to click Back in TOM when loading the file, to update sanction ID.</span>
      </p>
    </div>
  </div>
</div>

<style>
  .grid {
    display: grid;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .gap-4 {
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .md\:col-span-2 {
      grid-column: span 2 / span 2;
    }
  }
  
  input {
    appearance: none;
  }
  
  input:focus {
    outline: none;
  }
  
  .focus\:ring-2:focus {
    box-shadow: 0 0 0 2px var(--primary-500);
  }
  
  .focus\:border-transparent:focus {
    border-color: transparent;
  }
</style>