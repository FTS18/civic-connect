import crypto from 'crypto';

/**
 * Vercel API Route: Generate Cloudinary signature for secure uploads
 * 
 * URL: /api/cloudinary-signature
 * Method: POST
 * 
 * This endpoint is called by the frontend to get a signed upload token.
 * The signature is generated server-side using the API Secret (kept private).
 * 
 * Environment Variables Required (set in Vercel dashboard):
 * - CLOUDINARY_API_SECRET (from Cloudinary Account Settings → API Keys)
 * 
 * Response: { signature, timestamp }
 */

export default function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      console.error('CLOUDINARY_API_SECRET not set in Vercel environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate timestamp (required by Cloudinary)
    const timestamp = Math.floor(Date.now() / 1000);

    // Create signature: SHA1(api_secret + params)
    // Cloudinary requires params to be sorted alphabetically
    const paramsToSign: Record<string, string> = {
      timestamp: timestamp.toString(),
    };

    // Convert to string format for signing: "key1=value1&key2=value2"
    const paramString = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Generate SHA1 signature
    const signature = crypto
      .createHash('sha1')
      .update(paramString + apiSecret)
      .digest('hex');

    // Return signature and timestamp to frontend
    return res.status(200).json({
      signature,
      timestamp,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
