import { Recommendation } from './recommendation'; // Assuming this exists

/**
 * Core soil health card data containing analysis results
 * @interface SoilReport
 */
export interface SoilReport {
  /**
   * Unique identifier for soil report
   */
  id: string;

  /**
   * Indian state name
   */
  state: string;

  /**
   * Associated fertilizer recommendations
   */
  recommendations?: Recommendation[];
}

/**
 * Partial type for updating existing soil reports
 */
export type UpdateSoilReportDto = Partial<Omit<SoilReport, 'id' | 'recommendations'>>;

/**
 * Type for creating new soil reports
 */
export type CreateSoilReportDto = Omit<SoilReport, 'id' | 'recommendations'>;

/**
 * Type for soil report with expanded recommendation relations
 */
export type SoilReportWithRecommendations = SoilReport & {
  recommendations: Recommendation[];
};

/**
 * Type for soil report without recommendation relations
 */
export type SoilReportWithoutRecommendations = Omit<SoilReport, 'recommendations'>;

/**
 * Type for filtering/querying soil reports
 */
export interface SoilReportFilters {
  state?: string;
}