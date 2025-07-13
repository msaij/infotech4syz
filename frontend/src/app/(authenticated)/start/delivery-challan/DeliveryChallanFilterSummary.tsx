// DeliveryChallanFilterSummary.tsx
// Compact filter summary component showing active filters as chips

import React from 'react';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  customer: string;
  invoiceSubmission: 'all' | 'submitted' | 'not-submitted';
  invoiceDateFrom: string;
  invoiceDateTo: string;
  podDateFrom: string;
  podDateTo: string;
}

interface DeliveryChallanFilterSummaryProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const DeliveryChallanFilterSummary: React.FC<DeliveryChallanFilterSummaryProps> = ({
  filters,
  setFilters
}) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  if (!hasActiveFilters) return null;

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      customer: '',
      invoiceSubmission: 'all',
      invoiceDateFrom: '',
      invoiceDateTo: '',
      podDateFrom: '',
      podDateTo: ''
    });
  };

  return (
    <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">Active Filters:</span>
        <button
          onClick={clearAllFilters}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.dateFrom && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            From: {new Date(filters.dateFrom).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('dateFrom', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove date from filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.dateTo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            To: {new Date(filters.dateTo).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('dateTo', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove date to filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.customer && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Customer: {filters.customer}
            <button
              onClick={() => handleFilterChange('customer', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove customer filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.invoiceSubmission !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {filters.invoiceSubmission === 'submitted' ? 'Submitted' : 'Pending'}
            <button
              onClick={() => handleFilterChange('invoiceSubmission', 'all')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove invoice submission filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.invoiceDateFrom && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Invoice From: {new Date(filters.invoiceDateFrom).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('invoiceDateFrom', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove invoice date from filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.invoiceDateTo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Invoice To: {new Date(filters.invoiceDateTo).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('invoiceDateTo', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove invoice date to filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.podDateFrom && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            POD From: {new Date(filters.podDateFrom).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('podDateFrom', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove POD date from filter"
            >
              ×
            </button>
          </span>
        )}
        {filters.podDateTo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            POD To: {new Date(filters.podDateTo).toLocaleDateString()}
            <button
              onClick={() => handleFilterChange('podDateTo', '')}
              className="text-blue-600 hover:text-blue-800 ml-1"
              aria-label="Remove POD date to filter"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default DeliveryChallanFilterSummary; 