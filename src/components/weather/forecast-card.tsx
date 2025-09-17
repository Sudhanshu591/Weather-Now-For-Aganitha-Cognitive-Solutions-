'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { celsiusToFahrenheit, type ForecastData } from "@/lib/weather-utils";
import { WeatherIcon } from "./weather-icon";

interface ForecastCardProps {
  forecast: ForecastData[] | null;
  unit: 'C' | 'F';
  loading: boolean;
}

export function ForecastCard({ forecast, unit, loading }: ForecastCardProps) {
    if(loading) {
        return <ForecastSkeleton/>;
    }

    if(!forecast || forecast.length === 0) {
        return null;
    }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {forecast.map((day, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <WeatherIcon description={day.description} className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-medium w-12">{day.day}</p>
                    <p className="text-sm text-muted-foreground capitalize">{day.description}</p>
                </div>
              </div>
              <p className="font-semibold text-lg text-primary">
                {unit === 'C' ? day.temperature : celsiusToFahrenheit(day.temperature)}°
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ForecastSkeleton() {
    return (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-12" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
    )
}
