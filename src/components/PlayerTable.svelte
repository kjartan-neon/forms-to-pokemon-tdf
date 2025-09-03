<script lang="ts">
  import type { PlayerData, CsvFormat } from '../utils/csvUtils';
  
  export let data: PlayerData[];
  export let format: CsvFormat = 'norwegian';
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  
  function formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('no-NO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  }
</script>

<div class="card overflow-hidden">
  <div class="card-header">
    <div class="flex items-center">
      <span class="text-2xl mr-3">👥</span>
      <h3 class="text-xl font-bold">
      Player Data ({data.length} {data.length === 1 ? 'player' : 'players'})
      </h3>
    </div>
  </div>
  
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-primary-50">
        <tr>
          <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
            {format === 'wix' ? 'Order Date' : 'Timestamp'}
          </th>
          <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Email</th>
          <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Navn</th>
          <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Player ID</th>
          <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
            {format === 'wix' ? 'Birthday' : 'Fødselsår'}
          </th>
          {#if format === 'norwegian'}
            <th class="px-6 py-4 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">Mobil</th>
          {/if}
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data as player, index}
          <tr class="hover:bg-primary-50 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatTimestamp(player.timestamp)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <button 
                class="hover:text-primary-600 transition-colors duration-200 cursor-pointer font-medium"
                on:click={() => copyToClipboard(player.email)}
                title="Click to copy"
              >
                {player.email}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {player.navn}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-bold">
                {player.playerId}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {format === 'wix' ? player.birthYear : player.birthYear}
            </td>
            {#if format === 'norwegian'}
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {#if player.mobile}
                  <button 
                    class="hover:text-primary-600 transition-colors duration-200 cursor-pointer font-medium"
                    on:click={() => copyToClipboard(player.mobile)}
                    title="Click to copy"
                  >
                    {player.mobile}
                  </button>
                {:else}
                  <span class="text-gray-400 italic">Not provided</span>
                {/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  {#if data.length === 0}
    <div class="px-6 py-16 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span class="text-3xl">📊</span>
      </div>
      <p class="text-gray-600 text-lg">No data to display.</p>
      <p class="text-gray-500 text-sm mt-2">Paste CSV data above to get started.</p>
    </div>
  {/if}
</div>