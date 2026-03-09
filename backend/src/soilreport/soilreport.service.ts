// src/services/soil-report.service.ts

import { PrismaClient, SoilReport, Prisma } from '@prisma/client';
import { NotFoundException } from '../exceptions/not-found.exception';

// Types
interface PaginationParams {
  page?: number;
  limit?: number;
}

interface SoilReportFilters {
  state?: string;
}

export class SoilReportService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Find all soil reports with optional filtering and pagination
   */
  async findAll(
    filters?: SoilReportFilters,
    pagination?: PaginationParams
  ): Promise<SoilReport[]> {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const where: Prisma.SoilReportWhereInput = {};
    if (filters?.state) {
      where.state = filters.state;
    }

    return this.prisma.soilReport.findMany({
      where,
      skip,
      take: limit,
      include: {
        recommendations: true, // Include related recommendations
      },
    });
  }

  /**
   * Find soil report by ID
   */
  async findById(id: string): Promise<SoilReport> {
    const soilReport = await this.prisma.soilReport.findUnique({
      where: { id },
      include: {
        recommendations: true,
      },
    });

    if (!soilReport) {
      throw new NotFoundException(`Soil report with ID ${id} not found`);
    }

    return soilReport;
  }

  /**
   * Create new soil report
   */
  async create(data: Prisma.SoilReportCreateInput): Promise<SoilReport> {
    return this.prisma.soilReport.create({
      data,
      include: {
        recommendations: true,
      },
    });
  }

  /**
   * Update existing soil report
   */
  async update(
    id: string,
    data: Prisma.SoilReportUpdateInput
  ): Promise<SoilReport> {
    try {
      return await this.prisma.soilReport.update({
        where: { id },
        data,
        include: {
          recommendations: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Soil report with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Delete soil report
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.soilReport.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Soil report with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Aggregate reports by region/state
   */
  async getReportsByRegion(): Promise<
    Array<{ state: string; count: number }>
  > {
    return this.prisma.soilReport.groupBy({
      by: ['state'],
      _count: true,
    }).then(results => 
      results.map(result => ({
        state: result.state,
        count: result._count,
      }))
    );
  }
}

// src/exceptions/not-found.exception.ts
export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}