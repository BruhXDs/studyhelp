import React from 'react';
import { Volume2 } from 'lucide-react';

interface VolumeControlProps {
  label: string;
  volume: number;
  onVolumeChange: (value: number) => void;
}

export default function VolumeControl({ label, volume, onVolumeChange }: VolumeControlProps) {
  return (
    <div className="flex items-center gap-3">
      <Volume2 className="w-5 h-5 text-gray-600" />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}