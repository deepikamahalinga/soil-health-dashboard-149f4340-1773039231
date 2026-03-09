// soilreport.types.ts

import { z } from 'zod';

/**
 * Enum for Indian states
 */
export enum IndianState {
  ANDHRA_PRADESH = 'Andhra Pradesh',
  ASSAM = 'Assam',
  BIHAR = 'Bihar',
  // ... add all states
}

/**
 * Enum for soil report status
 */
export enum SoilReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

/**
 * Sort directions
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Base soil report interface containing all fields
 * @interface
 */
export interface SoilReport {
  /** Unique identifier */
  id: string;
  
  /** Indian state name */
  state: IndianState;
  
  /** District name */
  district: string;
  
  /** Village name */
  village: string;
  
  /** pH value between 0-14 */
  pH: number;
  
  /** Nitrogen content in ppm */
  nitrogen: number;
  
  /** Phosphorus content in ppm */
  phosphorus: number;
  
  /** Potassium content in ppm */
  potassium: number;
  
  /** Report status */
  status: SoilReportStatus;
  
  /** Timestamp of creation */
  createdAt: Date;
  
  /** Timestamp of last update */
  updatedAt: Date;
  
  /** Associated recommendations */
  recommendations?: Recommendation[];
}

/**
 * DTO for creating new soil report
 * @interface
 */
export type CreateSoilReportDto = Omit<SoilReport, 'id' | 'createdAt' | 'updatedAt' | 'recommendations'>;

/**
 * DTO for updating soil report
 * @interface
 */
export type UpdateSoilReportDto = Partial<CreateSoilReportDto>;

/**
 * Filter parameters for querying soil reports
 * @interface
 */
export interface SoilReportFilterParams {
  state?: IndianState;
  district?: string;
  village?: string;
  status?: SoilReportStatus;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Pagination parameters
 * @interface  
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Sort parameters
 * @interface
 */
export interface SortParams {
  sortBy: keyof SoilReport;
  direction: SortDirection;
}

/**
 * API response wrapper with metadata
 * @interface
 */
export interface ApiResponse<T> {
  data: T;
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Related recommendation interface
 * @interface
 */
export interface Recommendation {
  id: string;
  soilReportId: string;
  fertilizer: string;
  quantity: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Zod validation schema for soil report
 */
export const soilReportSchema = z.object({
  state: z.nativeEnum(IndianState),
  district: z.string().min(1),
  village: z.string().min(1),
  pH: z.number().min(0).max(14),
  nitrogen: z.number().positive(),
  phosphorus: z.number().positive(), 
  potassium: z.number().positive(),
  status: z.nativeEnum(SoilReportStatus)
});

/**
 * Zod validation schema for filter params
 */
export const filterParamsSchema = z.object({
  state: z.nativeEnum(IndianState).optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  status: z.nativeEnum(SoilReportStatus).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional()
});

/**
 * Type for list API response
 */
export type SoilReportListResponse = ApiResponse<SoilReport[]>;

/**
 * Type for single report API response  
 */
export type SoilReportResponse = ApiResponse<SoilReport>;