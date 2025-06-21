"use client";

import { useEffect, useState } from "react";

export default function UserWeather() {
  const [weather, setWeather] = useState<string>("날씨 정보를 불러오는 중 ..");

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeather("위치 정보를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const apiKey = "5c96f0152a68d61da7bdd8accf047ed4"; // 👉 OpenWeatherMap API 키를 여기에 넣으세요
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=kr&appid=${apiKey}`;

        try {
          const res = await fetch(url);
          const data = await res.json();

          const temp = data.main.temp; // 현재 기온
          const desc = data.weather[0].description; // 날씨 설명 (예: 흐림)
          setWeather(`${temp.toFixed(1)}°C ${desc}`);
        } catch (error) {
          console.error("날씨 정보를 불러오지 못했습니다.", error);
          setWeather("날씨 정보를 가져오지 못했습니다.");
        }
      },
      (error) => {
        console.error("위치 접근 실패", error);
        setWeather("위치 권한이 필요합니다.");
      }
    );
  }, []);

  return (
    <p className="pt-1 text-sm whitespace-pre-line">🌤 현재 날씨 : {weather}</p>
  );
}
