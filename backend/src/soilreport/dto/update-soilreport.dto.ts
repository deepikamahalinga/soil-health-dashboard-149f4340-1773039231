import { z } from 'zod';

export const UpdateSoilReportSchema = z.object({
  state: z.string()
    .min(1, 'State name cannot be empty')
    .optional()
});

export type UpdateSoilReportDto = z.infer<typeof UpdateSoilReportSchema>;