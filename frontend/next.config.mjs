/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...
  allowedDevOrigins: [
    // 'http://127.0.0.1:3000',
  ],
  // async headers() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: 'http://127.0.0.1:3000',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;