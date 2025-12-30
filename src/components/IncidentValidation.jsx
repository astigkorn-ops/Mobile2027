import { useState, useEffect } from 'react';
import { CheckCircle, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

export function IncidentValidation({ incidentId, className = '' }) {
  const { user } = useAuth();
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadValidations();
  }, [incidentId]);

  const loadValidations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/incidents/${incidentId}/validations`,
        {
          headers: user ? {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } : {}
        }
      );
      setValidationData(response.data);
    } catch (error) {
      console.error('Failed to load validations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!user) {
      toast.error('Please login to validate incidents');
      return;
    }

    setValidating(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/incidents/${incidentId}/validate`,
        { validation_type: 'confirm' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success('Incident confirmed successfully');
      await loadValidations();
    } catch (error) {
      console.error('Failed to validate incident:', error);
      toast.error(error.response?.data?.detail || 'Failed to validate incident');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveValidation = async () => {
    setValidating(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/incidents/${incidentId}/validate`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success('Validation removed');
      await loadValidations();
    } catch (error) {
      console.error('Failed to remove validation:', error);
      toast.error('Failed to remove validation');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-500 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  if (!validationData) return null;

  const hasConfirmations = validationData.confirmations > 0;

  return (
    <div className={`flex items-center justify-between ${className}`} data-testid="incident-validation">
      {/* Validation Count */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Users className={`w-4 h-4 ${hasConfirmations ? 'text-green-600' : 'text-slate-400'}`} />
          <span className={`text-xs font-medium ${hasConfirmations ? 'text-green-700' : 'text-slate-500'}`}>
            {validationData.confirmations} {validationData.confirmations === 1 ? 'person' : 'people'} confirmed
          </span>
        </div>
      </div>

      {/* Validation Button */}
      {user ? (
        validationData.user_validated ? (
          <button
            onClick={handleRemoveValidation}
            disabled={validating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
            data-testid="remove-validation-btn"
          >
            {validating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>Confirmed</span>
          </button>
        ) : (
          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="validate-incident-btn"
          >
            {validating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>Confirm</span>
          </button>
        )
      ) : (
        <button
          disabled
          className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"
          data-testid="login-required-btn"
        >
          Login to confirm
        </button>
      )}
    </div>
  );
}
