'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { celsiusToFahrenheit, type WeatherData, getWeatherImage } from "@/lib/weather-utils";
import { WeatherIcon } from "./weather-icon";
import { Droplets, Wind, Thermometer } from "lucide-react";
import Image from "next/image";

interface CurrentWeatherCardProps {
  weather: WeatherData | null;
  summary: string | null;
  unit: 'C' | 'F';
  loading: boolean;
}

export function CurrentWeatherCard({ weather, summary, unit, loading }: CurrentWeatherCardProps) {
  if (loading) {
    return <WeatherCardSkeleton />;
  }

  if (!weather) {
    return null;
  }

  const displayTemp = unit === 'C' ? weather.temperature : celsiusToFahrenheit(weather.temperature);
  const weatherImage = getWeatherImage(weather.description);

  return (
    <Card className="w-full max-w-md overflow-hidden relative shadow-lg aspect-[3/4] flex flex-col">
      <Image
        src={weatherImage.imageUrl}
        alt={weatherImage.description}
        fill
        className="object-cover z-0"
        data-ai-hint={weatherImage.imageHint}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

      <div className="relative z-20 text-primary-foreground p-6 flex flex-col h-full">
        <div className="flex-grow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold tracking-tight">{weather.location}</h2>
            <WeatherIcon description={weather.description} className="h-16 w-16 drop-shadow-lg" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-8xl font-black drop-shadow-md leading-none">{displayTemp}°</p>
            <p className="text-2xl font-medium capitalize pb-2">{weather.description}</p>
          </div>

          {summary && (
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg text-sm border border-white/20">
              <p>{summary}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 text-center text-sm mt-auto border-t border-white/20">
            <div className="flex flex-col items-center space-y-1">
              <Droplets className="h-5 w-5" />
              <span className="font-bold">{weather.humidity}%</span>
              <span className="text-xs opacity-80">Humidity</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Wind className="h-5 w-5" />
              <span className="font-bold">{weather.windSpeed} km/h</span>
              <span className="text-xs opacity-80">Wind</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
               <Thermometer className="h-5 w-5" />
               <span className="font-bold">{unit === 'C' ? 'Celsius' : 'Fahrenheit'}</span>
               <span className="text-xs opacity-80">Unit</span>
            </div>
        </div>
      </div>
    </Card>
  );
}

function WeatherCardSkeleton() {
    return (
        <div className="w-full max-w-md aspect-[3/4] rounded-lg bg-card shadow-lg p-6 space-y-6 animate-pulse">
            <div className="flex justify-between items-start">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-24 w-40" />
                <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    )
}
