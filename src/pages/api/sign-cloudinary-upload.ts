import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This is the handler function the Pages Router expects
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we are only handling POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!apiSecret || !uploadPreset) {
    console.error('Missing required Cloudinary environment variables');
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Use the Cloudinary SDK to create the signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: uploadPreset,
      },
      apiSecret
    );

    // Send the successful response back to the frontend
    res.status(200).json({ 
      signature, 
      timestamp,
      upload_preset: uploadPreset,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
    });

  } catch (error) {
    console.error('Error creating Cloudinary signature:', error);
    res.status(500).json({ error: 'Failed to create upload signature' });
  }
}