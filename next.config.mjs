/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The storefront uses no next/image remote optimization, so disable the
  // built-in Image Optimizer. On a self-hosted deployment this closes the
  // /_next/image endpoint entirely, neutralizing the Image Optimizer
  // remotePatterns DoS advisory without any visual impact.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
