<script lang="ts">
  import CsvParser from './components/CsvParser.svelte';
</script>

<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-16">
    <header class="text-center mb-12">
      <h1 class="text-5xl font-extrabold text-gradient mb-4">TDF Tournament Generator</h1>
      <p class="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
        A <span class="font-semibold text-primary-700">scrambleswitch.com</span> service: Convert player registration CSV to TDF XML format with ease
      </p>
      <div class="mt-6 flex justify-center">
        <div class="bg-white px-6 py-3 rounded-full shadow-md border border-primary-200">
          <span class="text-sm font-medium text-primary-700">✨ Professional • Fast • Reliable</span>
        </div>
      </div>
    </header>
    
    <CsvParser />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.5;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
  }
  
  .container {
    max-width: 1200px;
  }
</style>