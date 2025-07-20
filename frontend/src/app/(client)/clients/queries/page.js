export default function ClientQueriesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Queries</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Raise New Query
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          View and manage your queries to 4syz support team.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No queries found. Raise your first query to get started.</p>
        </div>
      </div>
    </div>
  )
} 