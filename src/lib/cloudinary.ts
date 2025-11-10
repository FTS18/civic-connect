// Image upload service using Cloudinary
// Uses upload preset for simplified uploads

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'civic_connect'; // Upload preset name

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Upload an image to Cloudinary using preset
 * @param file - The image file to upload
 * @param folder - Optional folder path (e.g., "civic-connect/issues")
 * @returns Promise with upload response
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'civic-connect'
): Promise<CloudinaryResponse> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured in .env');
  }

  console.log('🔍 [ZURI] Starting Cloudinary upload:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    folder: folder
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('tags', 'civic-connect,issue-report');

  try {
    console.log('📤 [ZURI] Sending request to Cloudinary API...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('📥 [ZURI] Cloudinary response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [ZURI] Cloudinary error response:', errorData);
      throw new Error(`Upload failed: ${response.statusText} - ${errorData}`);
    }

    const data: CloudinaryResponse = await response.json();
    
    console.log('✅ [ZURI] Cloudinary upload successful:', {
      public_id: data.public_id,
      secure_url: data.secure_url,
      width: data.width,
      height: data.height,
      size: data.size
    });

    // Verify the image is accessible
    console.log('🔍 [ZURI] Verifying image accessibility...');
    try {
      const verifyResponse = await fetch(data.secure_url, { method: 'HEAD' });
      if (verifyResponse.ok) {
        console.log('✅ [ZURI] Image verification successful - image is accessible at:', data.secure_url);
      } else {
        console.warn('⚠️ [ZURI] Image verification failed - status:', verifyResponse.status);
      }
    } catch (verifyError) {
      console.warn('⚠️ [ZURI] Image verification error:', verifyError);
    }

    return data;
  } catch (error) {
    console.error('❌ [ZURI] Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param folder - Optional folder path
 * @returns Promise with array of upload responses
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'civic-connect'
): Promise<CloudinaryResponse[]> {
  try {
    const uploads = files.map((file) => uploadImageToCloudinary(file, folder));
    return await Promise.all(uploads);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Test Cloudinary configuration and connectivity
 * @returns Promise with test results
 */
export async function testCloudinaryConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  console.log('🔍 [ZURI] Testing Cloudinary connection...');
  
  if (!CLOUD_NAME) {
    return {
      success: false,
      message: 'Cloudinary cloud name not configured'
    };
  }

  try {
    // Test with a small base64 image
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const formData = new FormData();
    formData.append('file', testImageData);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'test');
    formData.append('tags', 'test,connection-check');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ [ZURI] Cloudinary test upload successful:', data.secure_url);
      return {
        success: true,
        message: 'Cloudinary connection successful',
        details: {
          public_id: data.public_id,
          secure_url: data.secure_url
        }
      };
    } else {
      const errorText = await response.text();
      console.error('❌ [ZURI] Cloudinary test failed:', errorText);
      return {
        success: false,
        message: `Cloudinary test failed: ${response.status} ${response.statusText}`,
        details: errorText
      };
    }
  } catch (error) {
    console.error('❌ [ZURI] Cloudinary connection test error:', error);
    return {
      success: false,
      message: 'Cloudinary connection test failed',
      details: error
    };
  }
}

/**
 * Delete an image from Cloudinary (requires authenticated API)
 * Note: This requires server-side implementation with API secret
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  // This would require backend implementation with API secret
  // For now, images can be managed through Cloudinary dashboard
  console.warn(
    'Delete functionality requires backend implementation. Please use Cloudinary dashboard for deletion.'
  );
}

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  }
): string {
  const transformations = [];

  if (options?.width && options?.height) {
    transformations.push(`c_${options.crop || 'fill'},h_${options.height},w_${options.width}`);
  } else if (options?.width) {
    transformations.push(`w_${options.width}`);
  } else if (options?.height) {
    transformations.push(`h_${options.height}`);
  }

  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}
