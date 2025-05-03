// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ビルド時に ESLint のエラーを無視する
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // ビルド時に TypeScript の型チェックエラーを無視する
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // S3バケットからの画像読み込みを許可
  images: {
    domains: ['guides-next.s3.ap-northeast-1.amazonaws.com'],
  },
};

export default nextConfig;
