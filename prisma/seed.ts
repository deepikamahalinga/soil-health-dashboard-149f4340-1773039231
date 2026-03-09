import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

const prisma = new PrismaClient();

// Types
interface SeedStats {
  soilReports: number;
  errors: Error[];
}

interface SoilReportInput {
  id: string;
  state: string;
}

// Sample data
const indianStates = [
  'Maharashtra',
  'Karnataka',
  'Punjab',
  'Gujarat',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'West Bengal',
  'Rajasthan',
  'Bihar'
];

// Helper functions
const log = {
  info: (message: string) => console.log(chalk.blue(`ℹ️ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  error: (message: string) => console.log(chalk.red(`❌ ${message}`)),
  warning: (message: string) => console.log(chalk.yellow(`⚠️ ${message}`))
};

async function clearExistingData(): Promise<void> {
  try {
    log.warning('Clearing existing data...');
    await prisma.soilReport.deleteMany();
    log.success('Existing data cleared');
  } catch (error) {
    log.error(`Failed to clear existing data: ${error}`);
    throw error;
  }
}

async function createSoilReports(): Promise<SoilReportInput[]> {
  const soilReports: SoilReportInput[] = [];
  
  for (let i = 0; i < 10; i++) {
    soilReports.push({
      id: uuidv4(),
      state: indianStates[Math.floor(Math.random() * indianStates.length)]
    });
  }
  
  return soilReports;
}

export async function seed(): Promise<SeedStats> {
  const stats: SeedStats = {
    soilReports: 0,
    errors: []
  };

  try {
    log.info('Starting database seed...');

    // Clear existing data (optional)
    await clearExistingData();

    // Create soil reports
    log.info('Creating soil reports...');
    const soilReports = await createSoilReports();
    
    for (const report of soilReports) {
      try {
        await prisma.soilReport.create({
          data: report
        });
        stats.soilReports++;
      } catch (error) {
        stats.errors.push(error as Error);
        log.error(`Failed to create soil report: ${error}`);
      }
    }

    log.success(`Seed completed! Created ${stats.soilReports} soil reports`);
    
    if (stats.errors.length > 0) {
      log.warning(`Encountered ${stats.errors.length} errors during seeding`);
    }

  } catch (error) {
    log.error(`Seed failed: ${error}`);
    stats.errors.push(error as Error);
  } finally {
    await prisma.$disconnect();
  }

  return stats;
}

// Execute seed if running directly
if (require.main === module) {
  seed()
    .then((stats) => {
      console.log('Seed stats:', stats);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}