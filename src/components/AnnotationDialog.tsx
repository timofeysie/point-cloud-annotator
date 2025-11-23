import { useState, useEffect, useRef } from 'react';

interface AnnotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  x: number;
  y: number;
  z: number;
}

export function AnnotationDialog({ isOpen, onClose, onSave, x, y, z }: AnnotationDialogProps) {
  const [text, setText] = useState('');
  const [byteCount, setByteCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxBytes = 256;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setByteCount(0);
    }
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const bytes = new TextEncoder().encode(newText).length;
    
    if (bytes <= maxBytes) {
      setText(newText);
      setByteCount(bytes);
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Create Annotation</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Coordinates: ({x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)})
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="annotation-text" className="block text-sm font-medium text-gray-700 mb-2">
            Annotation Text
          </label>
          <textarea
            id="annotation-text"
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your annotation text..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-gray-500">
              {byteCount} / {maxBytes} bytes
            </span>
            {byteCount >= maxBytes * 0.9 && (
              <span className="text-xs text-orange-600">
                Approaching limit
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Press Cmd/Ctrl+Enter to save, Esc to cancel
        </p>
      </div>
    </div>
  );
}

