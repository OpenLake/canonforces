/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add the hostname for your Cloudinary images here
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
