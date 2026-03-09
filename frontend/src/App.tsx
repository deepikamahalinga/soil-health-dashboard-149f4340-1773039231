// app/layout.tsx
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Soil Health Dashboard',
  description: 'Location-based soil health data search interface for Indian farmers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}

// app/page.tsx
export default function HomePage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-4xl font-bold text-gray-900">
        Soil Health Dashboard
      </h1>
      <p className="text-xl text-gray-600">
        Search and analyze soil health data across Indian states
      </p>
    </div>
  );
}

// app/soil-reports/page.tsx
import SoilReportList from '@/components/soil-reports/SoilReportList';

export default function SoilReportsPage() {
  return <SoilReportList />;
}

// app/soil-reports/[id]/page.tsx
import { notFound } from 'next/navigation';
import SoilReportDetail from '@/components/soil-reports/SoilReportDetail';
import { getSoilReport } from '@/lib/api/soil-reports';

export default async function SoilReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const soilReport = await getSoilReport(params.id);
  
  if (!soilReport) {
    notFound();
  }

  return <SoilReportDetail report={soilReport} />;
}

// app/soil-reports/create/page.tsx
import SoilReportForm from '@/components/soil-reports/SoilReportForm';

export default function CreateSoilReportPage() {
  return <SoilReportForm />;
}

// app/soil-reports/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import SoilReportForm from '@/components/soil-reports/SoilReportForm';
import { getSoilReport } from '@/lib/api/soil-reports';

export default async function EditSoilReportPage({
  params,
}: {
  params: { id: string };
}) {
  const soilReport = await getSoilReport(params.id);
  
  if (!soilReport) {
    notFound();
  }

  return <SoilReportForm report={soilReport} />;
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
      <p className="text-gray-600 mt-2">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}