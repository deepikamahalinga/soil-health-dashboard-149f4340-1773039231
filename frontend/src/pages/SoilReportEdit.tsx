import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SoilReport } from '../types/SoilReport';
import { getSoilReport, updateSoilReport } from '../api/soilReports';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Validation schema
const soilReportSchema = z.object({
  id: z.string().uuid(),
  state: z.string().min(1, 'State is required'),
});

type FormData = z.infer<typeof soilReportSchema>;

export const SoilReportEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    id: '',
    state: '',
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await getSoilReport(id);
        if (!data) {
          navigate('/not-found');
          return;
        }
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        setError('Failed to fetch soil report');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const validated = soilReportSchema.parse(formData);
      
      setLoading(true);
      await updateSoilReport(validated);
      navigate(`/soil-reports/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof FormData, string>> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof FormData] = error.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError('Failed to update soil report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setValidationErrors({});
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Soil Report</h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="State"
          name="state"
          value={formData.state}
          onChange={handleChange}
          error={validationErrors.state}
          required
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};