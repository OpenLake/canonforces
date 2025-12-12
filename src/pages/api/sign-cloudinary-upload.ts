import type { NextApiRequest, NextApiResponse } from 'next';

// IMPORTANT: Use NEXT_PUBLIC_ env vars for frontend-visible values
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!cloudName || !uploadPreset) {
    console.error("Missing Cloudinary env vars", { cloudName, uploadPreset });
    return res.status(500).json({ error: "Cloudinary environment variables missing" });
  }

  // For UNSIGNED uploads we do NOT generate signature. Just return preset + cloud name.
  return res.status(200).json({
    cloud_name: cloudName,
    upload_preset: uploadPreset
  });
}
