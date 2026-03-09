import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Types
interface SoilReport {
  id: string;
  state: string;
  // Add other fields as needed
}

interface SortConfig {
  key: keyof SoilReport;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  state: string;
}

// Component
export const SoilReportList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortConfig>({ key: 'state', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({ state: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['soilReports', page, pageSize, sort, filters],
    async () => {
      // Replace with actual API call
      const response = await fetch(`/api/soil-reports?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  );

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/soil-reports/${id}`, { method: 'DELETE' });
      refetch();
      setDeleteId(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded mb-2" />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Error: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!data?.items?.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No soil reports found</p>
        <Link
          href="/soil-reports/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Report
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Soil Reports</h1>
        <Link
          href="/soil-reports/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by state..."
          className="border p-2 rounded"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => setSort({
                    key: 'state',
                    direction: sort.direction === 'asc' ? 'desc' : 'asc'
                  })}
                  className="flex items-center"
                >
                  State
                  {sort.key === 'state' && (
                    sort.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((report: SoilReport) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{report.state}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => router.push(`/soil-reports/${report.id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/soil-reports/${report.id}/edit`)}
                    className="text-green-500 hover:text-green-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(report.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border rounded p-2"
        >
          {[10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil((data.total || 0) / pageSize)}</span>
          <button
            disabled={page >= Math.ceil((data.total || 0) / pageSize)}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded max-w-sm mx-auto p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Delete
            </Dialog.Title>
            <p className="mb-4">Are you sure you want to delete this report?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SoilReportList;