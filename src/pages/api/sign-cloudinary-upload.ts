import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    console.log('Environment variables check:', {
      apiSecret: !!apiSecret,
      uploadPreset: !!uploadPreset,
      cloudName: !!cloudName,
      apiKey: !!apiKey
    });

    if (!apiSecret || !uploadPreset || !cloudName || !apiKey) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables.' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Manual signature generation without cloudinary SDK
    const crypto = require('crypto');
    const paramsToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    console.log('Generated signature successfully');

    return NextResponse.json({ 
      signature, 
      timestamp, 
      upload_preset: uploadPreset,
      cloud_name: cloudName,
      api_key: apiKey
    });
  } catch (error: any) {
    console.error('Error signing Cloudinary request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign request' },
      { status: 500 }
    );
  }
}
