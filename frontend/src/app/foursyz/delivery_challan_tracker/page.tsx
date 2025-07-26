'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeliveryChallanService, { 
  DeliveryChallan, 
  DeliveryChallanFilters,
  DeliveryChallanCreate 
} from '@/utils/deliveryChallanService'
import { AuthService } from '@/utils/auth'
import { env } from '@/config/env'

export default function DeliveryChallanTrackerPage() {
  const router = useRouter()
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isManager, setIsManager] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showLinkInvoiceForm, setShowLinkInvoiceForm] = useState(false)
  const [selectedChallans, setSelectedChallans] = useState<string[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<DeliveryChallanFilters>({
    skip: 0,
    limit: 10
  })

  // Form states
  const [formData, setFormData] = useState<DeliveryChallanCreate>({
    delivery_challan_date: new Date().toISOString().split('T')[0], // Set today as default
    client_name: '',
    summary_of_delivery_challan: '',
    tool_used: 'Zoho',
    invoice_number: '',
    invoice_date: '',
    invoice_submission_status: 'Not Submitted'
  })

  const [linkInvoiceData, setLinkInvoiceData] = useState({
    challan_ids: [] as string[],
    invoice_number: '',
    invoice_date: ''
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Function to clear errors
  const clearError = () => {
    setError(null)
  }

  // Function to clear success messages
  const clearSuccessMessage = () => {
    setSuccessMessage(null)
  }

  // Function to retry loading data
  const retryLoadData = () => {
    setError(null)
    checkUserAndLoadData()
    loadDeliveryChallans()
  }

  // Function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 5000) // Auto-hide after 5 seconds
  }

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    loadDeliveryChallans()
  }, [filters])

  const checkUserAndLoadData = async () => {
    try {
      // Get user data from localStorage (set by layout)
      const userDataString = localStorage.getItem('user')
      if (!userDataString) {
        router.push(env.ROUTES.LOGIN)
        return
      }

      const user = JSON.parse(userDataString)
      setUserData(user)
      setIsManager(DeliveryChallanService.isDeliveryChallanManager(user))
      
      // Load clients for dropdown
      try {
        const deliveryChallanService = new DeliveryChallanService()
        const clientsList = await deliveryChallanService.getClients()
        setClients(clientsList)
                 } catch (clientError: any) {
             console.error('Error loading clients:', clientError)
             let errorMessage = 'Failed to load client list'
             
             if (clientError?.message) {
               errorMessage = clientError.message
             } else if (typeof clientError === 'string') {
               errorMessage = clientError
             } else if (clientError && typeof clientError === 'object') {
               errorMessage = JSON.stringify(clientError)
             }
             
             setError(`Client loading error: ${errorMessage}`)
             // Set empty array as fallback
             setClients([])
           }
      
      setLoading(false)
             } catch (error: any) {
           console.error('Error checking user:', error)
           let errorMessage = 'Failed to validate user'
           
           if (error?.message) {
             errorMessage = error.message
           } else if (typeof error === 'string') {
             errorMessage = error
           } else if (error && typeof error === 'object') {
             errorMessage = JSON.stringify(error)
           }
           
           setError(`User validation error: ${errorMessage}`)
           setLoading(false)
         }
  }

  const loadDeliveryChallans = async () => {
    try {
      setLoading(true)
      const deliveryChallanService = new DeliveryChallanService()
      const response = await deliveryChallanService.getDeliveryChallans(filters)
      setDeliveryChallans(response.delivery_challans)
      setTotal(response.total)
      setError(null)
               } catch (error: any) {
             console.error('Error loading delivery challans:', error)
             let errorMessage = 'Failed to load delivery challans'
             
             if (error?.message) {
               errorMessage = error.message
             } else if (typeof error === 'string') {
               errorMessage = error
             } else if (error && typeof error === 'object') {
               errorMessage = JSON.stringify(error)
             }
             
             setError(`Data loading error: ${errorMessage}`)
           } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof DeliveryChallanFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: 0 // Reset to first page when filtering
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const skip = (page - 1) * (filters.limit || 10)
    setFilters(prev => ({ ...prev, skip }))
    setCurrentPage(page)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      
      let filePath = ''
      if (uploadedFile) {
        try {
          const deliveryChallanService = new DeliveryChallanService()
          const uploadResponse = await deliveryChallanService.uploadFile(uploadedFile)
          filePath = uploadResponse.file_path
                   } catch (uploadError: any) {
             console.error('Error uploading file:', uploadError)
             let uploadErrorMessage = 'Failed to upload file'
             
             if (uploadError?.message) {
               uploadErrorMessage = uploadError.message
             } else if (typeof uploadError === 'string') {
               uploadErrorMessage = uploadError
             } else if (uploadError && typeof uploadError === 'object') {
               uploadErrorMessage = JSON.stringify(uploadError)
             }
             
             setError(`File upload error: ${uploadErrorMessage}`)
             return
           }
      }

      const challanData: DeliveryChallanCreate = {
        ...formData,
        signed_acknowledgement_copy: filePath || undefined
      }

      const deliveryChallanService = new DeliveryChallanService()
      await deliveryChallanService.createDeliveryChallan(challanData)
      
      // Reset form and reload data
      setFormData({
        delivery_challan_date: new Date().toISOString().split('T')[0], // Set today as default
        client_name: '',
        summary_of_delivery_challan: '',
        tool_used: 'Zoho',
        invoice_number: '',
        invoice_date: '',
        invoice_submission_status: 'Not Submitted'
      })
                   setUploadedFile(null)
             setShowCreateForm(false)
             loadDeliveryChallans()
             showSuccessMessage('Delivery challan created successfully!')
                      } catch (error: any) {
             console.error('Error creating delivery challan:', error)
             let errorMessage = 'Failed to create delivery challan'
             
             if (error?.message) {
               errorMessage = error.message
             } else if (typeof error === 'string') {
               errorMessage = error
             } else if (error && typeof error === 'object') {
               errorMessage = JSON.stringify(error)
             }
             
             setError(`Creation error: ${errorMessage}`)
           } finally {
      setLoading(false)
    }
  }

  const handleDeleteChallan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery challan?')) {
      return
    }

    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const deliveryChallanService = new DeliveryChallanService()
                   await deliveryChallanService.deleteDeliveryChallan(id)
             loadDeliveryChallans()
             showSuccessMessage('Delivery challan deleted successfully!')
                      } catch (error: any) {
             console.error('Error deleting delivery challan:', error)
             let errorMessage = 'Failed to delete delivery challan'
             
             if (error?.message) {
               errorMessage = error.message
             } else if (typeof error === 'string') {
               errorMessage = error
             } else if (error && typeof error === 'object') {
               errorMessage = JSON.stringify(error)
             }
             
             setError(`Deletion error: ${errorMessage}`)
           } finally {
      setLoading(false)
    }
  }

  const handleChallanSelection = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChallans(prev => [...prev, id])
    } else {
      setSelectedChallans(prev => prev.filter(challanId => challanId !== id))
    }
  }

  const handleLinkInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChallans.length === 0) {
      setError('Please select at least one delivery challan')
      return
    }

    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const deliveryChallanService = new DeliveryChallanService()
      await deliveryChallanService.linkInvoice({
        challan_ids: selectedChallans,
        invoice_number: linkInvoiceData.invoice_number,
        invoice_date: linkInvoiceData.invoice_date
      })
      
      setLinkInvoiceData({
        challan_ids: [],
        invoice_number: '',
        invoice_date: ''
      })
                   setSelectedChallans([])
             setShowLinkInvoiceForm(false)
             loadDeliveryChallans()
             showSuccessMessage('Invoice linked successfully!')
                      } catch (error: any) {
             console.error('Error linking invoice:', error)
             let errorMessage = 'Failed to link invoice'
             
             if (error?.message) {
               errorMessage = error.message
             } else if (typeof error === 'string') {
               errorMessage = error
             } else if (error && typeof error === 'object') {
               errorMessage = JSON.stringify(error)
             }
             
             setError(`Invoice linking error: ${errorMessage}`)
           } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const totalPages = Math.ceil(total / (filters.limit || 10))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Challan Tracker</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage delivery challans and track invoice submissions
              </p>
            </div>
            <div className="flex space-x-3">
              {isManager && (
                <>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Challan
                  </button>
                  <button
                    onClick={() => setShowLinkInvoiceForm(true)}
                    disabled={selectedChallans.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Link to Invoice
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
                             <select
                 value={filters.client_name || ''}
                 onChange={(e) => handleFilterChange('client_name', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
               >
                 <option value="">All Clients</option>
                 {clients.length > 0 ? (
                   clients.map(client => (
                     <option key={client} value={client}>{client}</option>
                   ))
                 ) : (
                   <option value="" disabled>Loading clients...</option>
                 )}
               </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Status
              </label>
              <select
                value={filters.invoice_submission_status || ''}
                onChange={(e) => handleFilterChange('invoice_submission_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              >
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Not Submitted">Not Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Success</span>
                </div>
                <p className="mt-1 text-sm">{successMessage}</p>
              </div>
              <button
                onClick={clearSuccessMessage}
                className="ml-4 text-green-400 hover:text-green-600 focus:outline-none"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1 text-sm">{error}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={retryLoadData}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={clearError}
                className="ml-4 text-red-400 hover:text-red-600 focus:outline-none"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Delivery Challans Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Delivery Challans ({total})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isManager && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challan Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tool
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Status
                  </th>
                  {isManager && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedChallans.includes(challan.id)}
                          onChange={(e) => handleChallanSelection(challan.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {challan.delivery_challan_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {DeliveryChallanService.formatDate(challan.delivery_challan_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challan.client_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {challan.summary_of_delivery_challan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.tool_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.invoice_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        challan.invoice_submission_status === 'Submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {challan.invoice_submission_status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteChallan(challan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * (filters.limit || 10) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * (filters.limit || 10), total)}
                    </span>{' '}
                    of <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Challan Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Delivery Challan</h3>
              <form onSubmit={handleCreateChallan}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Challan Date
                    </label>
                    <input
                      type="date"
                      name="delivery_challan_date"
                      value={formData.delivery_challan_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                                         <select
                       name="client_name"
                       value={formData.client_name}
                       onChange={handleInputChange}
                       required
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                     >
                       <option value="">Select Client</option>
                       {clients.length > 0 ? (
                         clients.map(client => (
                           <option key={client} value={client}>{client}</option>
                         ))
                       ) : (
                         <option value="" disabled>Loading clients...</option>
                       )}
                     </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary
                    </label>
                    <textarea
                      name="summary_of_delivery_challan"
                      value={formData.summary_of_delivery_challan}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tool Used
                    </label>
                    <select
                      name="tool_used"
                      value={formData.tool_used}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    >
                      <option value="Zoho">Zoho</option>
                      <option value="Excel">Excel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signed Acknowledgement Copy
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={formData.invoice_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Submission Status
                    </label>
                    <select
                      name="invoice_submission_status"
                      value={formData.invoice_submission_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    >
                      <option value="Not Submitted">Not Submitted</option>
                      <option value="Submitted">Submitted</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Invoice Modal */}
      {showLinkInvoiceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Link to Invoice</h3>
              <form onSubmit={handleLinkInvoice}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selected Challans: {selectedChallans.length}
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={linkInvoiceData.invoice_number}
                      onChange={(e) => setLinkInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={linkInvoiceData.invoice_date}
                      onChange={(e) => setLinkInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowLinkInvoiceForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
