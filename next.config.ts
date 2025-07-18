// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...기존 설정들

  images: {
    domains: [
      "xhrvspicvhkkykqjhfob.supabase.co", // Supabase
      "api.thecatapi.com", // Cat API 의 메인 엔드포인트
      "cdn2.thecatapi.com", // ← 여기에 실제 이미지 호스트 이름 추가!
    ],

    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "xhrvspicvhkkykqjhfob.supabase.co",
    //     port: "",
    //     pathname: "/storage/v1/object/public/diary-images/**",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "api.thecatapi.com",
    //     port: "",
    //     pathname: "/v1/images/**",
    //   },
    // ],
  },
};

export default nextConfig;
