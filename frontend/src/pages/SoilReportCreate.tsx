import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// TODO: Import actual types and API functions
type SoilReport = {
  id: string;
  state: string;
  // Add other fields
};

type ApiError = {
  message: string;
};

const createSoilReport = async (data: SoilReport): Promise<SoilReport> => {
  // TODO: Implement API call
  return Promise.resolve(data);
};

// Validation schema
const soilReportSchema = z.object({
  id: z.string().uuid(),
  state: z.string().min(1, 'State is required'),
  // Add other field validations
});

export const SoilReportCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SoilReport>({
    id: uuidv4(),
    state: '',
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof SoilReport, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when field is modified
    setValidationErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      const validatedData = soilReportSchema.parse(formData);
      setIsLoading(true);

      // Submit to API
      await createSoilReport(validatedData);
      
      // Navigate on success
      navigate('/soil-reports');
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Partial<Record<keyof SoilReport, string>> = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as keyof SoilReport;
          errors[path] = error.message;
        });
        setValidationErrors(errors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      id: uuidv4(),
      state: '',
    });
    setValidationErrors({});
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Soil Report</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="state" 
              className="block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                validationErrors.state ? 'border-red-500' : ''
              }`}
              required
            />
            {validationErrors.state && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.state}
              </p>
            )}
          </div>

          {/* Add other form fields here */}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Report'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/soil-reports')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoilReportCreate;