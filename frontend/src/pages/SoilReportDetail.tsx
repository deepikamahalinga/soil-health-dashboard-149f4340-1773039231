import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { 
  ChevronLeftIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

import { SoilReport } from '../types/SoilReport';
import { Recommendation } from '../types/Recommendation';
import { 
  getSoilReport, 
  getRecommendationsForSoilReport,
  deleteSoilReport 
} from '../api/soilReports';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const SoilReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<SoilReport | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!id) throw new Error('No ID provided');
      
      const [reportData, recommendationsData] = await Promise.all([
        getSoilReport(id),
        getRecommendationsForSoilReport(id)
      ]);

      setReport(reportData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deleteSoilReport(id);
      navigate('/soil-reports');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert
        message={error}
        onRetry={fetchData}
      />
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Soil Report Not Found
        </h2>
        <button
          onClick={() => navigate('/soil-reports')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Soil Reports', href: '/soil-reports' },
          { label: `Report ${report.id}`, href: '#' }
        ]}
      />

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Soil Report Details
          </h3>
          <div className="space-x-3">
            <button
              onClick={() => navigate(`/soil-reports/${id}/edit`)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 
                         shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 
                         bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 
                         shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 
                         bg-white hover:bg-red-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.id}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.state}</dd>
            </div>
          </dl>
        </div>

        {recommendations.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900">
                Recommendations
              </h4>
              <div className="mt-4 space-y-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    {/* Render recommendation details */}
                    <p className="text-sm text-gray-600">{rec.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left 
                          overflow-hidden shadow-xl transform transition-all 
                          sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center 
                              justify-center h-12 w-12 rounded-full bg-red-100 
                              sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon 
                  className="h-6 w-6 text-red-600" 
                  aria-hidden="true" 
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <Dialog.Title 
                  as="h3" 
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  Delete Soil Report
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this soil report? This action 
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border 
                           border-transparent shadow-sm px-4 py-2 bg-red-600 
                           text-base font-medium text-white hover:bg-red-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md 
                           border border-gray-300 shadow-sm px-4 py-2 bg-white 
                           text-base font-medium text-gray-700 hover:bg-gray-50 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SoilReportDetail;