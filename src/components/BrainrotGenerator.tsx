import React, { useState } from 'react';
import TextInput from './TextInput';
import BrainrotOutput from './BrainrotOutput';
import SpeechControls from './SpeechControls';
import { Brain, Sparkles } from 'lucide-react';

export default function BrainrotGenerator() {
  const [inputText, setInputText] = useState('');
  const [repetitions, setRepetitions] = useState(3);

  const generateBrainrot = (text: string): string => {
    if (!text) return '';
    
    const emojis = ['💀', '😭', '❗', '⁉️', '‼️', '😱', '🔥', '💯', '⚡'];
    let result = '';
    
    for (let i = 0; i < repetitions; i++) {
      // Add random emojis between repetitions
      const randomEmojis = Array(2)
        .fill(0)
        .map(() => emojis[Math.floor(Math.random() * emojis.length)])
        .join('');
      
      // Alternate between uppercase and lowercase
      const formattedText = i % 2 === 0 ? text.toUpperCase() : text.toLowerCase();
      
      result += `${formattedText} ${randomEmojis} `;
    }
    
    return result.trim();
  };

  const brainrotText = generateBrainrot(inputText);

  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-8">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Brain className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-800">Brainrot Generator</h1>
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>

      <TextInput 
        value={inputText}
        onChange={setInputText}
        repetitions={repetitions}
        onRepetitionsChange={setRepetitions}
      />

      <BrainrotOutput text={brainrotText} />

      <SpeechControls text={brainrotText} />
    </div>
  );
}