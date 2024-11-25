import React, { useState } from 'react';
import TextInput from './TextInput';
import BrainrotOutput from './BrainrotOutput';
import SpeechControls from './SpeechControls';
import { Subtitles, Video } from 'lucide-react';

export default function SubtitleGenerator() {
  const [text, setText] = useState('');
  const [subtitleStyle, setSubtitleStyle] = useState('modern');

  const formatSubtitles = (inputText: string): string => {
    if (!inputText) return '';
    
    // Split text into lines and add timing information
    const lines = inputText.split('\n').filter(line => line.trim());
    let formattedText = '';
    let currentTime = 0;
    
    lines.forEach((line, index) => {
      const duration = (line.length * 0.05) + 1; // Rough estimate: 50ms per character + 1s base
      const startTime = formatTime(currentTime);
      currentTime += duration;
      const endTime = formatTime(currentTime);
      
      formattedText += `${index + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
    });
    
    return formattedText;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const subtitles = formatSubtitles(text);

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-2xl shadow-xl space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Video className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gameplay TTS Generator</h1>
        <Subtitles className="w-8 h-8 text-indigo-600" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your script
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here. Each line will be a separate subtitle..."
            className="w-full h-40 p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle Style
          </label>
          <select
            value={subtitleStyle}
            onChange={(e) => setSubtitleStyle(e.target.value)}
            className="w-full p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="modern">Modern Gaming</option>
            <option value="classic">Classic SRT</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
          <div className="p-4 bg-gray-900 rounded-xl">
            <pre className="text-white font-mono text-sm whitespace-pre-wrap">
              {subtitles || 'Subtitles will appear here...'}
            </pre>
          </div>
        </div>

        <SpeechControls text={text} />

        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              const blob = new Blob([subtitles], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'subtitles.srt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Download SRT
          </button>
        </div>
      </div>
    </div>
  );
}