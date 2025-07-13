// DeliveryChallanFilters.tsx
// Modern filter component for delivery challan table with date ranges, customer filter, and status filters.
// This component provides a comprehensive filtering interface for delivery challan data.

"use client";
import React, { useState, useRef, useEffect } from 'react';

// Filter state interface - defines the structure of all available filters
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

// Props interface for the filter component
interface DeliveryChallanFiltersProps {
  filters: FilterState;                    // Current filter state
  setFilters: (filters: FilterState) => void;  // Function to update filters
  customers: string[];                     // List of unique customer names for dropdown
  isOpen: boolean;                         // Whether filter dropdown is open
  onToggle: () => void;                    // Function to toggle filter dropdown
}

const DeliveryChallanFilters: React.FC<DeliveryChallanFiltersProps> = ({
  filters,
  setFilters,
  customers,
  isOpen,
  onToggle
}) => {
  // Ref for handling outside clicks to close the filter dropdown
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filters when clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Handle filter value changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  // Clear all active filters
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

  // Check if any filters are currently active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 h-10 rounded-lg font-semibold transition text-sm shadow border ${
          hasActiveFilters 
            ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
            : 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100'
        }`}
      >
        <span className="material-symbols-outlined text-lg">filter_list</span>
        Filters
        {/* Show count of active filters */}
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-zinc-300 rounded-lg shadow-xl p-6 w-80 animate-fade-in">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-800">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Challan Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Challan Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Customer
              </label>
              <select
                value={filters.customer}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Submission Status Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Invoice Submission Status
              </label>
              <select
                value={filters.invoiceSubmission}
                onChange={(e) => handleFilterChange('invoiceSubmission', e.target.value as any)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Pending</option>
              </select>
            </div>

            {/* Invoice Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Invoice Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.invoiceDateFrom}
                  onChange={(e) => handleFilterChange('invoiceDateFrom', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.invoiceDateTo}
                  onChange={(e) => handleFilterChange('invoiceDateTo', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="To"
                />
              </div>
            </div>

            {/* POD Upload Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                POD Upload Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.podDateFrom}
                  onChange={(e) => handleFilterChange('podDateFrom', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.podDateTo}
                  onChange={(e) => handleFilterChange('podDateTo', e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <div className="flex flex-wrap gap-2">
                {/* Display active date filters */}
                {filters.dateFrom && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button
                      onClick={() => handleFilterChange('dateFrom', '')}
                      className="text-blue-600 hover:text-blue-800"
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
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {/* Display active customer filter */}
                {filters.customer && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Customer: {filters.customer}
                    <button
                      onClick={() => handleFilterChange('customer', '')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {/* Display active invoice submission filter */}
                {filters.invoiceSubmission !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {filters.invoiceSubmission === 'submitted' ? 'Submitted' : 'Pending'}
                    <button
                      onClick={() => handleFilterChange('invoiceSubmission', 'all')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryChallanFilters; 