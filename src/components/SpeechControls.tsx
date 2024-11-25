import React, { useState } from 'react';
import { Volume2, Play, Pause, Settings2 } from 'lucide-react';

interface SpeechControlsProps {
  text: string;
}

export default function SpeechControls({ text }: SpeechControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const speak = () => {
    if (!text) return;

    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={isPlaying ? stopSpeaking : speak}
          disabled={!text}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors ${
            text ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" /> Stop
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> Preview
            </>
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Voice Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="p-4 bg-white border-2 border-purple-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed: {rate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pitch: {pitch}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}