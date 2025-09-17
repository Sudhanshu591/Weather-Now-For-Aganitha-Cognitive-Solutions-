'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface LocationSearchProps {
  onSearch: (location: string) => void;
  disabled?: boolean;
}

export function LocationSearch({ onSearch, disabled }: LocationSearchProps) {
  const [location, setLocation] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim());
      setLocation('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Search for a city..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={disabled}
        aria-label="Search for a location"
        className="bg-card"
      />
      <Button type="submit" size="icon" disabled={disabled}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
