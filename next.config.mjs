import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only include Monaco Plugin on client-side builds
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'json', 'html', 'css'],
          filename: 'static/[name].worker.js'
        })
      );
    }

    // Add formidable to externals
    config.externals = [...(config.externals || []), 'formidable'];

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        '*.mdx': ['mdx-loader'], // Adjust for specific loaders
      },
    },
    serverActions: true, // Enable server actions for FormData handling
  },
  // Add API configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    externalResolver: true,
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/api/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;