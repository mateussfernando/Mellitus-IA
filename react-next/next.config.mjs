/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['onnxruntime-node', 'bcryptjs'],
  outputFileTracingIncludes: {
    '/api/patients': ['./src/modelo/*.onnx'],
    '/api/patients/[id]': ['./src/modelo/*.onnx'],
    '/api/patients/[id]/consultations': ['./src/modelo/*.onnx'],
    '/api/consultations/[id]': ['./src/modelo/*.onnx'],
  },
};

export default nextConfig;
