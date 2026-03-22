/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow using the native LanceDB/vectordb package in server components / API routes
  serverExternalPackages: ['vectordb'],
};

module.exports = nextConfig;
