export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Test Page</h1>
        <p className="mb-6">
          This is a simple test page to verify that the basic routing is working.
        </p>
        <p className="text-sm text-gray-500">
          If you can see this page, it means the Next.js app is working correctly.
        </p>
        <div className="mt-6">
          <a 
            href="/"
            className="text-blue-600 hover:underline"
          >
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
} 