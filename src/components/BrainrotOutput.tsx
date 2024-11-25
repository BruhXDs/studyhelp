import React from 'react';
import { Copy } from 'lucide-react';

interface BrainrotOutputProps {
  text: string;
}

export default function BrainrotOutput({ text }: BrainrotOutputProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="min-h-[100px] p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl whitespace-pre-wrap break-words">
          {text || 'Your brainrot text will appear here...'}
        </div>
        {text && (
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/50 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}