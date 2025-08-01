'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeliveryChallanService, { 
  DeliveryChallan, 
  DeliveryChallanFilters,
  DeliveryChallanCreate 
} from '@/utils/deliveryChallanService'
import { UserData } from '@/utils/auth'
import { resourcePermissionService } from '@/utils/resourcePermissionService'
import { env } from '@/config/env'

export default function DeliveryChallanTrackerPage() {
  const router = useRouter()
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [permissions, setPermissions] = useState({
    canCreateChallan: false,
    canUpdateChallan: false,
    canReadChallan: false,
    canUploadFile: false,
    canLinkInvoice: false
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showLinkInvoiceForm, setShowLinkInvoiceForm] = useState(false)
  const [selectedChallans, setSelectedChallans] = useState<string[]>([])
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadDeliveryChallans()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

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
      
      // Check delivery challan permissions using policy-based system
      await checkDeliveryChallanPermissions(user)
      
      // Load clients for dropdown
      try {
        const deliveryChallanService = new DeliveryChallanService()
        const clientsList = await deliveryChallanService.getClients()
        setClients(clientsList)
      } catch (clientError: unknown) {
        console.error('Failed to load clients:', clientError)
        // Don't fail the entire page load for client loading error
      }
    } catch (error: unknown) {
      console.error('Error checking user:', error)
      setError('Failed to validate user')
    } finally {
      setLoading(false)
    }
  }

  const checkDeliveryChallanPermissions = async (userData: UserData) => {
    try {
      // Check all delivery challan-related permissions
      const createPermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_CREATE,
        resource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
      });

      const readPermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_READ,
        resource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
      });

      const updatePermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_UPDATE,
        resource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
      });



      const uploadPermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_UPLOAD,
        resource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
      });

      const linkInvoicePermission = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.DELIVERY_CHALLAN_LINK_INVOICE,
        resource: env.PERMISSIONS.RESOURCES.DELIVERY_CHALLAN_ALL
      });

      setPermissions({
        canCreateChallan: createPermission.allowed,
        canReadChallan: readPermission.allowed,
        canUpdateChallan: updatePermission.allowed,
        canUploadFile: uploadPermission.allowed,
        canLinkInvoice: linkInvoicePermission.allowed
      });
    } catch (error) {
      console.error('Failed to check delivery challan permissions:', error);
      // Set all permissions to false on error
      setPermissions({
        canCreateChallan: false,
        canReadChallan: false,
        canUpdateChallan: false,
        canUploadFile: false,
        canLinkInvoice: false
      });
    }
  };

  const loadDeliveryChallans = async () => {
    try {
      setLoading(true)
      const deliveryChallanService = new DeliveryChallanService()
      const response = await deliveryChallanService.getDeliveryChallans(filters)
      setDeliveryChallans(response.delivery_challans)
      setTotal(response.total)
      setError(null)
                   } catch (error: unknown) {
      console.error('Error loading delivery challans:', error)
      let errorMessage = 'Failed to load delivery challans'
      
      if (error instanceof Error && error.message) {
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
                           } catch (uploadError: unknown) {
          console.error('Error uploading file:', uploadError)
          let uploadErrorMessage = 'Failed to upload file'
          
          if (uploadError instanceof Error && uploadError.message) {
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
                          } catch (error: unknown) {
      console.error('Error creating delivery challan:', error)
      let errorMessage = 'Failed to create delivery challan'
      
      if (error instanceof Error && error.message) {
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



  const handleChallanSelection = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChallans(prev => [...prev, id])
    } else {
      setSelectedChallans(prev => prev.filter(challanId => challanId !== id))
    }
  }

  const handleRowClick = (challan: DeliveryChallan) => {
    setSelectedChallan(challan)
    setShowSidePanel(true)
  }

  const closeSidePanel = () => {
    setShowSidePanel(false)
    setSelectedChallan(null)
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
    } catch (error: unknown) {
      console.error('Error linking invoice:', error)
      let errorMessage = 'Failed to link invoice'
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Try to extract meaningful error information
        const errorObj = error as Record<string, unknown>
        if (errorObj.detail) {
          errorMessage = String(errorObj.detail)
        } else if (errorObj.error) {
          errorMessage = String(errorObj.error)
        } else {
          errorMessage = JSON.stringify(error)
        }
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivery Challan Tracker</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage delivery challans and track invoice submissions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {permissions.canCreateChallan && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  Create Challan
                </button>
              )}
              {permissions.canLinkInvoice && (
                <button
                  onClick={() => {
                    setShowLinkInvoiceForm(true)
                    setLinkInvoiceData(prev => ({
                      ...prev,
                      invoice_date: new Date().toISOString().split('T')[0] // Set to today
                    }))
                  }}
                  disabled={selectedChallans.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Link to Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showSidePanel ? 'lg:w-2/3 xl:w-3/4' : 'lg:w-full'}`}>
          <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-3 sm:mb-4 relative">
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 sm:mb-4 relative">
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Delivery Challans ({total})
                </h2>
              </div>
              
                              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {permissions.canReadChallan && (
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                        )}
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Challan Number
                        </th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Summary
                        </th>
                        <th className="hidden md:table-cell px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tool
                        </th>
                        <th className="hidden lg:table-cell px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Number
                        </th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Status
                        </th>
                        {permissions.canReadChallan && (
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryChallans.map((challan) => (
                      <tr 
                        key={challan.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => handleRowClick(challan)}
                      >
                    {permissions.canReadChallan && (
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedChallans.includes(challan.id)}
                          onChange={(e) => handleChallanSelection(challan.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 w-24 sm:w-auto">
                      {challan.delivery_challan_number}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-sm text-gray-500 w-20 sm:w-auto">
                      {DeliveryChallanService.formatDate(challan.delivery_challan_date)}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-sm text-gray-900 w-24 sm:w-auto">
                      {challan.client_name}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-sm text-gray-900 max-w-20 sm:max-w-xs lg:max-w-sm truncate">
                      {challan.summary_of_delivery_challan}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {challan.tool_used}
                    </td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {challan.invoice_number || '-'}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        challan.invoice_submission_status === 'Submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {challan.invoice_submission_status}
                      </span>
                    </td>

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
        </div>

                {/* Side Panel */}
        {showSidePanel && selectedChallan && (
          <>
            {/* Mobile Overlay */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden" onClick={closeSidePanel}></div>
            
            {/* Side Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg z-50 lg:relative lg:w-1/3 xl:w-1/4 lg:border-l lg:border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-900">Challan Details</h3>
                <button
                  onClick={closeSidePanel}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
              {/* Challan Number */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Challan Number</h4>
                <p className="text-sm text-gray-600">{selectedChallan.delivery_challan_number}</p>
              </div>

              {/* Date */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Date</h4>
                <p className="text-sm text-gray-600">{DeliveryChallanService.formatDate(selectedChallan.delivery_challan_date)}</p>
              </div>

              {/* Client */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Client</h4>
                <p className="text-sm text-gray-600">{selectedChallan.client_name}</p>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Summary</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedChallan.summary_of_delivery_challan}</p>
              </div>

              {/* Tool Used */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Tool Used</h4>
                <p className="text-sm text-gray-600">{selectedChallan.tool_used}</p>
              </div>

              {/* Invoice Information */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Invoice Information</h4>
                <div className="space-y-1">
                  <div>
                    <span className="text-xs text-gray-500">Invoice Number:</span>
                    <p className="text-sm text-gray-600">{selectedChallan.invoice_number || 'Not specified'}</p>
                  </div>
                  {selectedChallan.invoice_date && (
                    <div>
                      <span className="text-xs text-gray-500">Invoice Date:</span>
                      <p className="text-sm text-gray-600">{DeliveryChallanService.formatDate(selectedChallan.invoice_date)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedChallan.invoice_submission_status === 'Submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedChallan.invoice_submission_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Information */}
              {selectedChallan.signed_acknowledgement_copy && (
                <div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Signed Acknowledgement</h4>
                  <div>
                    <a
                      href={`${env.API_BASE_URL}/uploads/delivery_challan/${selectedChallan.signed_acknowledgement_copy}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View File
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}

            </div>
          </div>
            </>
          )}
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
                    {permissions.canUploadFile && (
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                      />
                    )}
                    {!permissions.canUploadFile && (
                      <p className="text-sm text-gray-500">You do not have permission to upload files.</p>
                    )}
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
