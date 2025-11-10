import crypto from 'crypto';

/**
 * Netlify Function: Generate Cloudinary signature for secure uploads
 * 
 * This function is called by the frontend to get a signed upload token.
 * The signature is generated server-side using the API Secret (kept private).
 * 
 * Environment Variables Required:
 * - CLOUDINARY_API_SECRET (from Cloudinary Account Settings → API Keys)
 * 
 * Frontend calls: POST /api/cloudinary-signature
 * Returns: { signature, timestamp }
 */

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      console.error('CLOUDINARY_API_SECRET not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate timestamp (required by Cloudinary)
    const timestamp = Math.floor(Date.now() / 1000);

    // Create signature: SHA1(api_secret + params)
    // Cloudinary requires params to be sorted alphabetically
    const paramsToSign = {
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
    return new Response(
      JSON.stringify({
        signature,
        timestamp,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate signature' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
