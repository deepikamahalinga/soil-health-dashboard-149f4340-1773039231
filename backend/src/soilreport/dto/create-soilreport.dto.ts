import { z } from 'zod';

/**
 * DTO Schema for creating a new soil report
 * Validates request payload for soil report creation
 */
export const CreateSoilReportSchema = z.object({
  /**
   * Indian state name
   * Must be a non-empty string
   */
  state: z.string({
    required_error: "State name is required",
    invalid_type_error: "State must be a string"
  })
    .min(1, "State name cannot be empty")
    .max(100, "State name is too long")
    .trim()
});

/**
 * Type definition for soil report creation payload
 * Inferred from the Zod schema
 */
export type CreateSoilReportDto = z.infer<typeof CreateSoilReportSchema>;