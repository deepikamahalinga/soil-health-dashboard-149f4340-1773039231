import { Request, Response, NextFunction } from 'express';
import { SoilReportService } from '../services/soilReport.service';
import { CreateSoilReportDto, UpdateSoilReportDto } from '../dtos/soilReport.dto';
import { PaginationParams } from '../types/pagination';

export class SoilReportController {
  constructor(private readonly soilReportService: SoilReportService) {}

  /**
   * Get all soil reports with pagination and filtering
   */
  public getAllSoilReports = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const paginationParams: PaginationParams = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        filters: req.query.filters as Record<string, unknown>
      };

      const reports = await this.soilReportService.getAllSoilReports(paginationParams);
      return res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get soil report by ID
   */
  public getSoilReportById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const report = await this.soilReportService.getSoilReportById(id);
      
      if (!report) {
        return res.status(404).json({ message: 'Soil report not found' });
      }

      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new soil report
   */
  public createSoilReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const soilReportData: CreateSoilReportDto = req.body;
      const newReport = await this.soilReportService.createSoilReport(soilReportData);
      return res.status(201).json(newReport);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update existing soil report
   */
  public updateSoilReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const updateData: UpdateSoilReportDto = req.body;
      
      const updatedReport = await this.soilReportService.updateSoilReport(id, updateData);
      
      if (!updatedReport) {
        return res.status(404).json({ message: 'Soil report not found' });
      }

      return res.status(200).json(updatedReport);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete soil report
   */
  public deleteSoilReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const deleted = await this.soilReportService.deleteSoilReport(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Soil report not found' });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
const soilReportService = new SoilReportService();
export const soilReportController = new SoilReportController(soilReportService);