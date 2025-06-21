"use client";

import { useEffect, useState } from "react";

export default function UserLocation() {
  const [location, SetLocation] = useState("위치 정보를 불러 오는 중 ..");

  useEffect(() => {
    if (!navigator.geolocation) {
      SetLocation("위치 정보를 지원하지 않는 브라우저입니다.");
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        //Nominatim API를 통해 좌표 -> 주소 변환
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();

        const address = data?.address;
        const fullAddress = `${address?.state ?? ""} ${address?.city ?? address?.country ?? ""} ${address?.suburb ?? ""}`;
        SetLocation(fullAddress || "주소 정보를 불러올 수 없습니다.");
      },
      (error) => {
        SetLocation("위치 접근이 거부되었습니다.");
        console.error(error);
      }
    );
  }, []);
  return (
    <p className="pt-1 text-sm whitespace-pre-line">
      📍 현재 위치 : {location}
    </p>
  );
}
