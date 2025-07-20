export default function FoursyzQueriesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Query Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            New Query
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Manage internal queries and client queries.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No queries found. Create your first query to get started.</p>
        </div>
      </div>
    </div>
  )
} 