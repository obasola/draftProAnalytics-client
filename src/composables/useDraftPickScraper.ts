import { ref, computed } from 'vue';
import { draftPickScraperService, type DraftPickScraperResult } from '@/services/draftPickScraperService';

/**
 * Draft Pick Scraper Composable
 * Manages state and operations for draft pick scraping
 * Follows Single Responsibility Principle
 */
export function useDraftPickScraper() {
  const isLoading = ref(false);
  const currentResult = ref<DraftPickScraperResult | null>(null);
  const multipleResults = ref<DraftPickScraperResult[]>([]);
  const error = ref<string | null>(null);
  const validationResult = ref<{ year: number; isValid: boolean } | null>(null);

  const hasResults = computed(() => currentResult.value !== null || multipleResults.value.length > 0);
  
  const totalPicksScraped = computed(() => {
    if (currentResult.value?.scraperResult) {
      return currentResult.value.scraperResult.totalPicks;
    }
    return multipleResults.value.reduce((sum, result) => {
      return sum + (result.scraperResult?.totalPicks || 0);
    }, 0);
  });

  const totalPlayersCreated = computed(() => {
    if (currentResult.value?.importResult) {
      return currentResult.value.importResult.playersCreated;
    }
    return multipleResults.value.reduce((sum, result) => {
      return sum + (result.importResult?.playersCreated || 0);
    }, 0);
  });

  const totalDraftPicksCreated = computed(() => {
    if (currentResult.value?.importResult) {
      return currentResult.value.importResult.draftPicksCreated;
    }
    return multipleResults.value.reduce((sum, result) => {
      return sum + (result.importResult?.draftPicksCreated || 0);
    }, 0);
  });

  /**
   * Scrapes draft picks for a single year
   */
  async function scrapeDraftYear(year: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    currentResult.value = null;

    try {
      const response = await draftPickScraperService.scrapeDraftYear(year);
      
      if (response.success && response.data) {
        currentResult.value = response.data;
        return true;
      } else {
        error.value = 'Failed to scrape draft picks';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Scrapes draft picks for multiple years
   */
  async function scrapeMultipleYears(years: number[]): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    multipleResults.value = [];

    try {
      const response = await draftPickScraperService.scrapeMultipleYears(years);
      
      if (response.success && response.data) {
        multipleResults.value = response.data;
        return true;
      } else {
        error.value = 'Failed to scrape draft picks';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Validates if the scraper can access the URL for a given year
   */
  async function validateScraper(year: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    validationResult.value = null;

    try {
      const response = await draftPickScraperService.validateScraper(year);
      
      if (response.success && response.data) {
        validationResult.value = response.data;
        return response.data.isValid;
      } else {
        error.value = 'Failed to validate scraper';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resets all state
   */
  function reset() {
    currentResult.value = null;
    multipleResults.value = [];
    error.value = null;
    validationResult.value = null;
  }

  return {
    // State
    isLoading,
    currentResult,
    multipleResults,
    error,
    validationResult,
    
    // Computed
    hasResults,
    totalPicksScraped,
    totalPlayersCreated,
    totalDraftPicksCreated,
    
    // Actions
    scrapeDraftYear,
    scrapeMultipleYears,
    validateScraper,
    reset,
  };
}