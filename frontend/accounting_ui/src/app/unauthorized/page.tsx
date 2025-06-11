import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
      <div className="p-10 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-lg text-gray-700">
          You do not have the necessary permissions to access this page.
        </p>
        <p className="mt-2 text-gray-600">
          Please contact your administrator if you believe this is an error.
        </p>
        <Link href="/" className="inline-block px-6 py-3 mt-8 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Go to Homepage
        </Link>
      </div>
    </div>
  );
} 