
export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 text-center px-4">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-700">
          This page is for (Admin) only<br />

        </p>
        <a
          href="/dashboard"
          className="mt-6 inline-block text-sm text-blue-600 underline hover:text-blue-800"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}
