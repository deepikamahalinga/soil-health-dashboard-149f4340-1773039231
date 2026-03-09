// src/routes/soilReport.routes.ts

import express from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createSoilReportSchema,
  updateSoilReportSchema 
} from '../schemas/soilReport.schema';
import {
  getSoilReports,
  getSoilReportById,
  createSoilReport,
  updateSoilReport,
  deleteSoilReport,
  getSoilReportsByRegion
} from '../controllers/soilReport.controller';

const router = express.Router();

/**
 * @route GET /api/soilreports
 * @desc Get all soil reports with optional filtering
 */
router.get('/', getSoilReports);

/**
 * @route GET /api/soilreports/region
 * @desc Get aggregated soil reports by region
 */
router.get('/region', getSoilReportsByRegion);

/**
 * @route GET /api/soilreports/:id
 * @desc Get a single soil report by ID
 */
router.get('/:id', getSoilReportById);

/**
 * @route POST /api/soilreports
 * @desc Create a new soil report
 */
router.post(
  '/',
  validateRequest(createSoilReportSchema),
  createSoilReport
);

/**
 * @route PUT /api/soilreports/:id
 * @desc Update an existing soil report
 */
router.put(
  '/:id',
  validateRequest(updateSoilReportSchema),
  updateSoilReport
);

/**
 * @route DELETE /api/soilreports/:id
 * @desc Delete a soil report
 */
router.delete('/:id', deleteSoilReport);

export default router;