import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play, Settings, X } from 'lucide-react';
import { splitTextIntoFragments } from '../utils/textUtils';

interface Voice {
  name: string;
  lang: string;
}

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentFragment, setCurrentFragment] = useState(0);
  const [fragments, setFragments] = useState<string[]>([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth.getVoices().map(voice => ({
        name: voice.name,
        lang: voice.lang
      }));
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    updateVoices();
    synth.onvoiceschanged = updateVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    setFragments(splitTextIntoFragments(text));
  }, [text]);

  const speakFragment = (fragment: string, index: number) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(fragment);
    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoice) || null;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentFragment(index);
    };

    utterance.onend = () => {
      if (index < fragments.length - 1) {
        speakFragment(fragments[index + 1], index + 1);
      } else {
        setIsPlaying(false);
        setCurrentFragment(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentFragment(0);
    };

    synth.speak(utterance);
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    
    if (fragments.length > 0) {
      speakFragment(fragments[0], 0);
    }
  };

  const stopSpeaking = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setCurrentFragment(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Text to Speech</h1>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert to speech..."
        className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-lg"
      />

      <div className="bg-gray-900 p-6 rounded-lg">
        <div className="text-white text-2xl font-semibold mb-4">Preview</div>
        <div className="space-y-4">
          {fragments.map((fragment, index) => (
            <div
              key={index}
              className={`text-2xl transition-all ${
                currentFragment === index
                  ? 'text-white scale-105'
                  : 'text-gray-400 scale-100'
              }`}
            >
              {fragment}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={togglePlayPause}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> Play
            </>
          )}
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Voice Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate: {rate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}