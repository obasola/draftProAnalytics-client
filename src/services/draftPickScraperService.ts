import { api } from './api';
import type { ApiResponse } from './apiResponse';

/**
 * Draft Pick Scraper Result Interface
 */
export interface DraftPickScraperResult {
  success: boolean;
  year: number;
  scraperResult?: {
    year: number;
    picks: any[];
    totalPicks: number;
    scrapedAt: string;
  };
  importResult?: {
    totalProcessed: number;
    playersCreated: number;
    playersUpdated: number;
    draftPicksCreated: number;
    draftPicksUpdated: number;
    playerTeamsCreated: number;
    errors: Array<{
      pick: any;
      error: string;
    }>;
  };
  error?: string;
  duration: number;
}

/**
 * Draft Pick Scraper Service
 * Handles API calls for draft pick scraping operations
 * Follows Single Responsibility Principle
 */
const baseUrl = '/api/scraper/draft-picks';
export const draftPickScraperService = {
  /**
   * Scrapes and imports draft picks for a single year
   */
  async scrapeDraftYear(year: number): Promise<ApiResponse<DraftPickScraperResult>> {
    return api.post(baseUrl+'/scrape', { year });
  },

  /**
   * Scrapes and imports draft picks for multiple years
   */
  async scrapeMultipleYears(years: number[]): Promise<ApiResponse<DraftPickScraperResult[]>> {
    return api.post(baseUrl+'/scrape-multiple', { years });
  },

  /**
   * Validates if the scraper can access the URL for a given year
   */
  async validateScraper(year: number): Promise<ApiResponse<{ year: number; isValid: boolean }>> {
    return api.get(baseUrl+`/validate/${year}`);
  },
};