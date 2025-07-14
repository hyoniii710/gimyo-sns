// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...기존 설정들

  images: {
    domains: [
      "xhrvspicvhkkykqjhfob.supabase.co", // Supabase
      "api.thecatapi.com", // The Cat API
    ],
    // remotePatterns를 이용해 더 세밀하게 허용할 수도 있습니다.
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
