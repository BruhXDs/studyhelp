import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  repetitions: number;
  onRepetitionsChange: (value: number) => void;
}

export default function TextInput({ 
  value, 
  onChange, 
  repetitions, 
  onRepetitionsChange 
}: TextInputProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <MessageSquare className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-32 pl-12 pr-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Repetitions: {repetitions}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={repetitions}
          onChange={(e) => onRepetitionsChange(Number(e.target.value))}
          className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}