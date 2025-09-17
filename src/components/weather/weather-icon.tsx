'use client';
import type { LucideIcon } from 'lucide-react';
import { getWeatherIcon } from '@/lib/weather-utils';
import { cn } from '@/lib/utils';

interface WeatherIconProps {
  description: string;
  className?: string;
}

export function WeatherIcon({ description, className }: WeatherIconProps) {
  const Icon: LucideIcon = getWeatherIcon(description);
  return <Icon className={cn('h-8 w-8', className)} />;
}
