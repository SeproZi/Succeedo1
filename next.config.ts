import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Ensuring the output mode is NOT set to 'export' for dynamic rendering.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push('handlebars');
    return config;
  }
};

export default nextConfig;
