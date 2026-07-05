// NEXT_OUTPUT=export builds a static site (used by the GitHub Pages workflow);
// local `pnpm dev` / `pnpm build` keep the full server with API routes.
const isStaticExport = process.env.NEXT_OUTPUT === 'export'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  ...(isStaticExport && {
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  }),
}

export default nextConfig
