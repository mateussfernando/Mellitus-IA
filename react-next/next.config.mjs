/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['onnxruntime-node', 'bcryptjs'],
};

export default nextConfig;
