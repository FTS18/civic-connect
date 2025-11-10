import { useState } from 'react';
import { uploadImageToCloudinary, testCloudinaryConnection } from '@/lib/cloudinary';

const CloudinaryTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult('🔍 [ZURI] Testing Cloudinary connection...');
    
    try {
      const result = await testCloudinaryConnection();
      if (result.success) {
        setTestResult(`✅ [ZURI] Cloudinary test successful!\n\nTest image uploaded to: ${result.details?.secure_url}`);
      } else {
        setTestResult(`❌ [ZURI] Cloudinary test failed!\n\nError: ${result.message}\nDetails: ${JSON.stringify(result.details, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ [ZURI] Test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setTestResult('❌ [ZURI] Please select a file first');
      return;
    }

    setIsLoading(true);
    setTestResult('📸 [ZURI] Uploading your file to Cloudinary...');

    try {
      const result = await uploadImageToCloudinary(selectedFile, 'test-uploads');
      setTestResult(`✅ [ZURI] File uploaded successfully!\n\nURL: ${result.secure_url}\nPublic ID: ${result.public_id}\nSize: ${result.size} bytes\nDimensions: ${result.width}x${result.height}`);
    } catch (error) {
      setTestResult(`❌ [ZURI] Upload failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        🧪 Cloudinary Test Panel (Zuri Debug)
      </h2>
      
      <div className="space-y-4">
        {/* Test Connection */}
        <div>
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? '🔄 Testing...' : '🔍 Test Cloudinary Connection'}
          </button>
        </div>

        {/* File Upload Test */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test File Upload:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
          />
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          <button
            onClick={handleFileUpload}
            disabled={isLoading || !selectedFile}
            className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? '📤 Uploading...' : '📸 Upload Test File'}
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test Results:</h3>
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {testResult}
            </pre>
          </div>
        )}

        {/* Environment Info */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Environment Check:</h3>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <div>Cloud Name: {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '❌ Not set'}</div>
            <div>API Key: {import.meta.env.VITE_CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set'}</div>
            <div>API Secret: {import.meta.env.VITE_CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTest;