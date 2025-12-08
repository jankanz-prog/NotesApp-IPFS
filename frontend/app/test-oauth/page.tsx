'use client';

export default function TestOAuth() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">OAuth Configuration Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Client ID:</h2>
            <p className="text-sm break-all bg-gray-100 p-2 rounded">
              {clientId || 'NOT LOADED'}
            </p>
          </div>
          
          <div>
            <h2 className="font-semibold">Current Origin:</h2>
            <p className="text-sm bg-gray-100 p-2 rounded">
              {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
            </p>
          </div>
          
          <div>
            <h2 className="font-semibold">Expected Origins in Google Console:</h2>
            <ul className="text-sm bg-gray-100 p-2 rounded space-y-1">
              <li>✓ http://localhost:3000</li>
              <li>✓ http://localhost:3001</li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h2 className="font-semibold mb-2">Instructions:</h2>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Verify the Client ID above matches your Google Console</li>
              <li>Verify the Current Origin is in your Authorized JavaScript origins</li>
              <li>Go to: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Click on your OAuth Client ID</li>
              <li>Under "Authorized JavaScript origins", add the Current Origin shown above</li>
              <li>Click Save and wait 2-5 minutes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
