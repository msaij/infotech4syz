// DeliveryChallanFilterStatus.tsx
// Filter status component to show active filters and row counts.
// This component displays a summary of current filter results and active filter criteria.

import React from 'react';

// Filter state interface - matches the main filter state structure
interface FilterState {
  dateFrom: string;           // Start date for challan date range filter
  dateTo: string;             // End date for challan date range filter
  customer: string;           // Customer name filter (exact match)
  invoiceSubmission: 'all' | 'submitted' | 'not-submitted';  // Invoice submission status filter
  invoiceDateFrom: string;    // Start date for invoice date range filter
  invoiceDateTo: string;      // End date for invoice date range filter
  podDateFrom: string;        // Start date for POD upload date range filter
  podDateTo: string;          // End date for POD upload date range filter
}

// Props interface for the filter status component
interface DeliveryChallanFilterStatusProps {
  filters: FilterState;       // Current filter state
  totalRows: number;          // Total number of challans in the dataset
  filteredRows: number;       // Number of challans after applying filters
}

const DeliveryChallanFilterStatus: React.FC<DeliveryChallanFilterStatusProps> = ({
  filters,
  totalRows,
  filteredRows
}) => {
  // Check if any filters are currently active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  // Don't render anything if no filters are active
  if (!hasActiveFilters) return null;

  // Format filter values for user-friendly display
  // This function converts filter keys and values into readable text
  const formatFilterValue = (key: string, value: string) => {
    switch (key) {
      case 'dateFrom':
        return `From: ${new Date(value).toLocaleDateString()}`;
      case 'dateTo':
        return `To: ${new Date(value).toLocaleDateString()}`;
      case 'invoiceDateFrom':
        return `Invoice From: ${new Date(value).toLocaleDateString()}`;
      case 'invoiceDateTo':
        return `Invoice To: ${new Date(value).toLocaleDateString()}`;
      case 'podDateFrom':
        return `POD From: ${new Date(value).toLocaleDateString()}`;
      case 'podDateTo':
        return `POD To: ${new Date(value).toLocaleDateString()}`;
      case 'customer':
        return `Customer: ${value}`;
      case 'invoiceSubmission':
        return value === 'submitted' ? 'Status: Submitted' : 'Status: Pending';
      default:
        return `${key}: ${value}`;
    }
  };

  // Create a list of active filters with formatted values
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value !== '' && value !== 'all')  // Only include non-empty, non-default values
    .map(([key, value]) => formatFilterValue(key, value));

  return (
    <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        {/* Display the result count */}
        <span className="text-sm font-medium text-blue-800">
          Showing {filteredRows} of {totalRows} challans
        </span>
        
        {/* Display active filter criteria */}
        <div className="text-xs text-blue-700">
          {activeFilters.join(' • ')}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanFilterStatus; 