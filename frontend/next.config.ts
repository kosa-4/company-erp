import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 개발 환경 API 프록시 설정
   * 프론트엔드(3000) → 백엔드(8080) 요청 시 CORS 문제 해결
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // 개발 모드 우측 하단 뱃지 제거 (Next.js 16 호환성)
  // @ts-ignore
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
