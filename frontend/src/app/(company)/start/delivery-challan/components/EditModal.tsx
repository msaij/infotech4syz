// EditModal.tsx
// Modal dialog for adding or editing a delivery challan. Uses react-hook-form for validation and file upload.

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/components/access-providers/auth-context';
import { DjangoAPIClient, ENDPOINTS } from '@/app/utils/serviceIntegration';

interface EditModalProps {
  open: boolean;
  row: Record<string, any> | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  isLoading?: boolean;
}

interface Client {
  id: string;
  name: string;
  short_name: string;
}

const EditModal: React.FC<EditModalProps> = ({ open, row, onClose, onSave, isLoading = false }) => {
  const { authFetch } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Form setup and reset logic
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ 
    defaultValues: row || {
      date: new Date().toISOString().split('T')[0], // Set today's date as default for new challans
      invoice_submission: false
    }
  });

  // Fetch clients when modal opens
  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const apiClient = new DjangoAPIClient(authFetch);
      const response = await apiClient.getClients();
      if (response.ok) {
        const data = await response.json();
        setClients(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  React.useEffect(() => {
    if (row) {
      // Editing existing challan
      reset(row);
    } else {
      // Adding new challan
      reset({
        date: new Date().toISOString().split('T')[0],
        client: '',
        dc_summary: '',
        delivery_executives: '',
        invoice_number: '',
        invoice_date: '',
        invoice_submission: false,
        proof_of_delivery: undefined
      });
    }
  }, [row, reset]);

  if (!open) return null;
  return (
    // Modal container and form
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{row && row.challan_number ? 'Edit Challan' : 'Add New Challan'}</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {/* Challan number (read-only in edit mode) */}
          {row && row.challan_number && (
            <div>
              <label className="block mb-1 font-medium">Challan No.</label>
              <input value={row.challan_number} readOnly className="w-full border px-3 py-2 rounded bg-zinc-100 text-zinc-500" />
            </div>
          )}
          {/* Date field */}
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input 
              type="date" 
              {...register('date', { 
                required: 'Date is required',
                validate: (value) => {
                  if (!value) return 'Date is required';
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // End of today
                  if (selectedDate > today) return 'Date cannot be in the future';
                  return true;
                }
              })} 
              className="w-full border px-3 py-2 rounded" 
            />
            {errors.date && <span className="text-red-500 text-sm">{errors.date.message?.toString()}</span>}
          </div>
          {/* Client selection field */}
          <div>
            <label className="block mb-1 font-medium">Client</label>
            <select 
              {...register('client', { 
                required: 'Client is required'
              })} 
              className="w-full border px-3 py-2 rounded"
              disabled={loadingClients}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.short_name})
                </option>
              ))}
            </select>
            {errors.client && <span className="text-red-500 text-sm">{errors.client.message?.toString()}</span>}
            {loadingClients && <span className="text-blue-500 text-sm">Loading clients...</span>}
          </div>
          {/* Description field */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea {...register('dc_summary')} className="w-full border px-3 py-2 rounded" />
          </div>
          {/* Delivery Executives field */}
          <div>
            <label className="block mb-1 font-medium">Delivery Executives</label>
            <input {...register('delivery_executives')} className="w-full border px-3 py-2 rounded" />
          </div>
          {/* Invoice Number field */}
          <div>
            <label className="block mb-1 font-medium">Invoice Number</label>
            <input {...register('invoice_number')} className="w-full border px-3 py-2 rounded" />
          </div>
          {/* Invoice Date field */}
          <div>
            <label className="block mb-1 font-medium">Invoice Date</label>
            <input type="date" {...register('invoice_date')} className="w-full border px-3 py-2 rounded" />
          </div>
          {/* Invoice Submission checkbox */}
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('invoice_submission')} id="invoice_submission" />
            <label htmlFor="invoice_submission" className="font-medium">Invoice Submission</label>
          </div>
          {/* File upload for acknowledgement */}
          <div>
            <label className="block mb-1 font-medium">Acknowledgement File</label>
            <input type="file" {...register('proof_of_delivery')} className="w-full" />
          </div>
          {/* Modal actions */}
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 text-zinc-400 hover:text-zinc-700 text-2xl font-bold" onClick={onClose} aria-label="Close" disabled={isLoading}>×</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal; 