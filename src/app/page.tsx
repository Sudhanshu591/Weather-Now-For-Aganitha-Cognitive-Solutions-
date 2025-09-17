'use client';

import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { LocationSearch } from '@/components/weather/location-search';
import { UnitToggle } from '@/components/weather/unit-toggle';
import { CurrentWeatherCard } from '@/components/weather/current-weather-card';
import { ForecastCard } from '@/components/weather/forecast-card';
import { getMockWeatherData, type FullWeatherInfo } from '@/lib/weather-utils';
import { generateWeatherSummary } from '@/ai/flows/generate-weather-summary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type Unit = 'C' | 'F';

export default function WeatherNowPage() {
  const { toast } = useToast();
  const [location, setLocation] = React.useState<string>('New York');
  const [weatherInfo, setWeatherInfo] = React.useState<FullWeatherInfo | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [unit, setUnit] = React.useState<Unit>('C');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWeatherData = React.useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setWeatherInfo(null);
    try {
      const data = await getMockWeatherData(loc);
      setWeatherInfo(data);
      setLocation(data.current.location);
      
      try {
        const summaryResult = await generateWeatherSummary(data.current);
        setSummary(summaryResult.summary);
      } catch (aiError) {
        console.error("AI summary generation failed:", aiError);
      }

    } catch (e) {
      const errorMessage = `Could not fetch weather for "${loc}". Please try another location.`;
      setError(errorMessage);
      setWeatherInfo(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      },
      (err) => {
        console.warn(`Geolocation error: ${err.message}. Falling back to default.`);
        fetchWeatherData(location);
      },
      { timeout: 5000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (searchLocation: string) => {
    fetchWeatherData(searchLocation);
  };

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === 'C' ? 'F' : 'C'));
  };

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <header className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">WeatherNow</h1>
            <UnitToggle unit={unit} onToggle={handleUnitToggle} />
          </header>

          <LocationSearch onSearch={handleSearch} disabled={loading} />
          
          {error && !loading && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="animate-in fade-in-50 duration-500 space-y-6">
              <CurrentWeatherCard 
                weather={weatherInfo?.current ?? null}
                summary={summary}
                unit={unit}
                loading={loading}
              />
              {!error && <ForecastCard 
                forecast={weatherInfo?.forecast ?? null}
                unit={unit}
                loading={loading}
              />}
          </div>

          <footer className="text-center text-sm text-muted-foreground pt-4">
            <p>Made By Sudhanshu Tamboli</p>
          </footer>
        </div>
      </main>
      <Toaster />
    </>
  );
}
