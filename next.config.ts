import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...기존 설정들

  images: {
    // Supabase 퍼블릭 스토리지 도메인 등록
    domains: ["xhrvspicvhkkykqjhfob.supabase.co"],

    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "xhrvspicvhkkykqjhfob.supabase.co",
    //     port: "",
    //     pathname: "/storage/v1/object/public/diary-images/**",
    //   },
    // ],
  },
};

export default nextConfig;
