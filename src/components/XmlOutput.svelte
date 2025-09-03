<script lang="ts">
  import { generateTdfXml, type TournamentConfig } from '../utils/xmlGenerator';
  import type { PlayerData } from '../utils/csvUtils';
  
  export let players: PlayerData[];
  export let config: TournamentConfig;
  
  let xmlContent = '';
  let isGenerating = false;
  
  $: canGenerate = players.length > 0 && config.organizerName && config.organizerPopId;
  
  $: if (canGenerate) {
    generateXml();
  } else {
    xmlContent = '';
  }
  
  async function generateXml() {
    if (!canGenerate) return;
    
    isGenerating = true;
    try {
      // Simulate processing time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 200));
      xmlContent = generateTdfXml(players, config);
    } finally {
      isGenerating = false;
    }
  }
  
  function downloadXml() {
    if (!xmlContent) return;
    
    const generateFilename = (): string => {
      if (config.tournamentName) {
        // Replace spaces with dashes and remove special characters
        return config.tournamentName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
      return `tournament-${Date.now()}`;
    };
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generateFilename()}.tdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function copyXml() {
    if (!xmlContent) return;
    navigator.clipboard.writeText(xmlContent);
  }
</script>

{#if canGenerate}
  <div class="card overflow-hidden">
    <div class="card-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-2xl mr-3">📄</span>
          <h3 class="text-xl font-bold">Generated TDF XML</h3>
        </div>
        <div class="flex items-center space-x-3">
          {#if isGenerating}
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm font-medium">Generating...</span>
            </div>
          {:else if xmlContent}
            <button
              class="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
              on:click={copyXml}
              title="Copy XML to clipboard"
            >
              Copy
            </button>
            <button
              class="px-4 py-2 text-sm bg-white text-primary-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-semibold"
              on:click={downloadXml}
            >
              Download TDF
            </button>
          {/if}
        </div>
      </div>
    </div>
    
    {#if xmlContent && !isGenerating}
      <div class="p-8">
        <div class="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto border-2 border-gray-100">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{xmlContent}</pre>
        </div>
        
        <div class="mt-6 flex items-center justify-between text-sm">
          <div class="bg-primary-100 text-primary-700 px-3 py-2 rounded-full font-medium">
            {players.length} players included
          </div>
          <div class="bg-gray-100 text-gray-600 px-3 py-2 rounded-full font-medium">
            {xmlContent.length} characters
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="card p-8">
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span class="text-3xl">📄</span>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-4">TDF XML Generation</h3>
      <p class="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
        {#if players.length === 0}
          Parse your CSV data and configure tournament details to generate professional TDF XML files.
        {:else}
          Please fill in the required organizer information to generate your XML file.
        {/if}
      </p>
      <div class="mt-6">
        <div class="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
          <span class="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
          Ready to generate
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .max-h-96 {
    max-height: 24rem;
  }
  
  .overflow-y-auto {
    overflow-y: auto;
  }
  
  .leading-relaxed {
    line-height: 1.625;
  }
  
  .whitespace-pre-wrap {
    white-space: pre-wrap;
  }
</style>