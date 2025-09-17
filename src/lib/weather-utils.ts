import { z } from 'zod';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { PlaceHolderImages, type ImagePlaceholder } from './placeholder-images';

export const WeatherDataSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  description: z.string(),
});
export type WeatherData = z.infer<typeof WeatherDataSchema>;

export const ForecastDataSchema = z.object({
  day: z.string(),
  temperature: z.number(),
  description: z.string(),
});
export type ForecastData = z.infer<typeof ForecastDataSchema>;

export const FullWeatherInfoSchema = z.object({
  current: WeatherDataSchema,
  forecast: z.array(ForecastDataSchema),
});
export type FullWeatherInfo = z.infer<typeof FullWeatherInfoSchema>;

const weatherDescriptions = [
  "Sunny", "Clear", "Partly cloudy", "Cloudy", "Overcast",
  "Mist", "Fog", "Showers", "Rain", "Thunderstorm", "Snow"
];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getMockWeatherData = async (location: string): Promise<FullWeatherInfo> => {
  const hash = simpleHash(location.toLowerCase());

  const currentData: WeatherData = {
    location: location.split(',')[0].trim().replace(/\b\w/g, l => l.toUpperCase()),
    temperature: Math.round((hash % 35) - 5), 
    humidity: (hash % 60) + 40,
    windSpeed: parseFloat(((hash % 30) + 5).toFixed(1)),
    description: weatherDescriptions[hash % weatherDescriptions.length],
  };

  const forecastData: ForecastData[] = Array(5).fill(null).map((_, i) => {
    const dayHash = simpleHash(`${location.toLowerCase()}${i}`);
    const dayIndex = (new Date().getDay() + i + 1) % 7;
    return {
      day: days[dayIndex],
      temperature: Math.round((dayHash % 15) + (currentData.temperature - 8)),
      description: weatherDescriptions[dayHash % weatherDescriptions.length],
    };
  });

  await new Promise(resolve => setTimeout(resolve, 500 + (hash % 500)));
  
  return { current: currentData, forecast: forecastData };
};

export const celsiusToFahrenheit = (celsius: number): number => Math.round((celsius * 9) / 5 + 32);

export const getWeatherIcon = (description: string): LucideIcon => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("thunder")) return CloudLightning;
  if (lowerDesc.includes("snow")) return CloudSnow;
  if (lowerDesc.includes("rain") || lowerDesc.includes("shower")) return CloudRain;
  if (lowerDesc.includes("fog") || lowerDesc.includes("mist")) return CloudFog;
  if (lowerDesc.includes("partly cloudy")) return CloudSun;
  if (lowerDesc.includes("cloud")) return Cloud;
  if (lowerDesc.includes("windy")) return Wind;
  if (lowerDesc.includes("sunny") || lowerDesc.includes("clear")) return Sun;
  return CloudSun;
};

export const getWeatherImage = (description: string): ImagePlaceholder => {
    const lowerDesc = description.toLowerCase();
    const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages.find(img => img.id === 'default')!;

    if (lowerDesc.includes('snow')) return findImage('snowy');
    if (lowerDesc.includes('rain') || lowerDesc.includes('shower')) return findImage('rainy');
    if (lowerDesc.includes('cloud')) return findImage('cloudy');
    if (lowerDesc.includes('sunny') || lowerDesc.includes('clear')) return findImage('sunny');
    
    return findImage('default');
}
