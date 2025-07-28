'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClientService, ClientData, CreateClientData } from '@/utils/clientService'
import { AuthService, UserData } from '@/utils/auth'
import { PolicyService } from '@/utils/policyService'
import { env } from '@/config/env'

export default function ClientDetailsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [permissions, setPermissions] = useState({
    canCreateClient: false,
    canUpdateClient: false,
    canDeleteClient: false,
    canReadClient: false
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState<CreateClientData>({
    client_full_name: '',
    client_tag_name: '',
    address: '',
    city: '',
    zip: '',
    state: '',
    country: 'India',
    onboarding_date: '',
    offboarding_date: ''
  })

  useEffect(() => {
    checkUserAndLoadClients()
  }, [])

  const checkUserAndLoadClients = async () => {
    try {
      // Get user data from AuthService instead of localStorage for consistency
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) {
        router.push(env.ROUTES.LOGIN)
        return
      }

      const userData = await AuthService.validateUser(token)
      if (!userData || !AuthService.isValidUser(userData)) {
        router.push(env.ROUTES.LOGIN)
        return
      }

      setUser(userData)
      
      // Check client management permissions using policy-based system
      await checkClientPermissions(userData)

      // Load clients if user has read permission
      if (permissions.canReadClient) {
        await loadClients()
      } else {
        // Redirect users without read permission to dashboard
        router.push(env.ROUTES.DASHBOARD)
        return
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setError('Failed to verify user permissions')
    } finally {
      setLoading(false)
    }
  }

  const checkClientPermissions = async (userData: UserData) => {
    try {
      // Check all client-related permissions
      const createPermission = await PolicyService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.CLIENT_CREATE,
        resource: env.PERMISSIONS.RESOURCES.CLIENT_ALL
      });

      const readPermission = await PolicyService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.CLIENT_READ,
        resource: env.PERMISSIONS.RESOURCES.CLIENT_ALL
      });

      const updatePermission = await PolicyService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.CLIENT_UPDATE,
        resource: env.PERMISSIONS.RESOURCES.CLIENT_ALL
      });

      const deletePermission = await PolicyService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.CLIENT_DELETE,
        resource: env.PERMISSIONS.RESOURCES.CLIENT_ALL
      });

      setPermissions({
        canCreateClient: createPermission.allowed,
        canReadClient: readPermission.allowed,
        canUpdateClient: updatePermission.allowed,
        canDeleteClient: deletePermission.allowed
      });
    } catch (error) {
      console.error('Failed to check client permissions:', error);
      // Set all permissions to false on error
      setPermissions({
        canCreateClient: false,
        canReadClient: false,
        canUpdateClient: false,
        canDeleteClient: false
      });
    }
  };

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await ClientService.getClients()
      setClients(response.clients)
      setError('')
    } catch (error: any) {
      setError(error.message || 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Filter out empty offboarding_date
      const submitData = {
        ...formData,
        offboarding_date: formData.offboarding_date || undefined
      }

      await ClientService.createClient(submitData)
      setSuccess('Client created successfully!')
      setShowCreateForm(false)
      setFormData({
        client_full_name: '',
        client_tag_name: '',
        address: '',
        city: '',
        zip: '',
        state: '',
        country: 'India',
        onboarding_date: '',
        offboarding_date: ''
      })
      await loadClients()
    } catch (error: any) {
      setError(error.message || 'Failed to create client')
    }
  }

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete client "${clientName}"?`)) {
      return
    }

    try {
      await ClientService.deleteClient(clientId)
      setSuccess('Client deleted successfully!')
      await loadClients()
    } catch (error: any) {
      setError(error.message || 'Failed to delete client')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  // Early return for non-CEO users to prevent any content rendering
  if (!permissions.canReadClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                CEO Access
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showCreateForm ? 'Cancel' : 'Add New Client'}
              </button>
              <button
                onClick={() => router.push(env.ROUTES.DASHBOARD)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Create Client Form */}
          {showCreateForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Client</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    name="client_full_name"
                    value={formData.client_full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Tag Name *
                  </label>
                  <input
                    type="text"
                    name="client_tag_name"
                    value={formData.client_tag_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Onboarding Date *
                  </label>
                  <input
                    type="date"
                    name="onboarding_date"
                    value={formData.onboarding_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offboarding Date
                  </label>
                  <input
                    type="date"
                    name="offboarding_date"
                    value={formData.offboarding_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clients List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Clients ({clients.length})
              </h2>
            </div>
            
            {clients.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No clients found. Click "Add New Client" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tag Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Onboarding Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {client.client_full_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.client_tag_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.city}, {client.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(client.onboarding_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.offboarding_date 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {client.offboarding_date ? 'Offboarded' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(client.id, client.client_full_name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
