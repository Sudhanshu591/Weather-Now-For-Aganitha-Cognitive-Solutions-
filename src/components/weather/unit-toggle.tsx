'use client';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UnitToggleProps {
  unit: 'C' | 'F';
  onToggle: () => void;
}

export function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="unit-toggle" className="text-sm font-medium text-muted-foreground">
        °C
      </Label>
      <Switch
        id="unit-toggle"
        checked={unit === 'F'}
        onCheckedChange={onToggle}
        aria-label="Toggle temperature unit"
      />
      <Label htmlFor="unit-toggle" className="text-sm font-medium text-muted-foreground">
        °F
      </Label>
    </div>
  );
}
