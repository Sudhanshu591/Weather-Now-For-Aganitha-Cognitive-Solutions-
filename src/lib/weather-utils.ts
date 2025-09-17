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

const openMeteoWeatherCodes: { [key: number]: string } = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


const getGeocode = async (location: string): Promise<{ latitude: number, longitude: number, name: string } | null> => {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
    try {
        const response = await fetch(geoUrl);
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.results || data.results.length === 0) return null;
        const { latitude, longitude, name } = data.results[0];
        return { latitude, longitude, name };
    } catch (e) {
        console.error("Geocoding failed", e);
        return null;
    }
}


export const getWeatherData = async (location: string): Promise<FullWeatherInfo> => {
    let geo;

    const latLonMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);

    if (latLonMatch) {
      const lat = parseFloat(latLonMatch[1]);
      const lon = parseFloat(latLonMatch[2]);
      geo = { latitude: lat, longitude: lon, name: 'Current Location' };
    } else {
        geo = await getGeocode(location);
    }

    if (!geo) {
        throw new Error(`Could not find location: ${location}`);
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=6`;
    
    const response = await fetch(weatherUrl, { next: { revalidate: 3600 } });
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();

    const currentData: WeatherData = {
        location: geo.name,
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        description: openMeteoWeatherCodes[data.current.weather_code] || 'Clear',
    };

    const forecastData: ForecastData[] = data.daily.time.slice(1).map((date: string, i: number) => {
        const dayIndex = new Date(date).getDay();
        return {
            day: days[dayIndex],
            temperature: Math.round(data.daily.temperature_2m_max[i + 1]),
            description: openMeteoWeatherCodes[data.daily.weather_code[i + 1]] || 'Clear',
        };
    });

    return { current: currentData, forecast: forecastData };
};


// The mock function is kept for reference or fallback, but getWeatherData should be used.
export const getMockWeatherData = async (location: string): Promise<FullWeatherInfo> => {
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };
  
  const weatherDescriptions = Object.values(openMeteoWeatherCodes);
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
  if (lowerDesc.includes("rain") || lowerDesc.includes("shower") || lowerDesc.includes('drizzle')) return CloudRain;
  if (lowerDesc.includes("fog") || lowerDesc.includes("mist")) return CloudFog;
  if (lowerDesc.includes("partly cloudy")) return CloudSun;
  if (lowerDesc.includes("cloud") || lowerDesc.includes("overcast")) return Cloud;
  if (lowerDesc.includes("windy")) return Wind;
  if (lowerDesc.includes("clear")) return Sun;
  return CloudSun;
};

export const getWeatherImage = (description: string): ImagePlaceholder => {
    const lowerDesc = description.toLowerCase();
    const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages.find(img => img.id === 'default')!;

    if (lowerDesc.includes('snow')) return findImage('snowy');
    if (lowerDesc.includes('rain') || lowerDesc.includes('shower') || lowerDesc.includes('drizzle')) return findImage('rainy');
    if (lowerDesc.includes('cloud') || lowerDesc.includes('overcast')) return findImage('cloudy');
    if (lowerDesc.includes('clear') || lowerDesc.includes('sunny')) return findImage('sunny');
    
    return findImage('default');
}
