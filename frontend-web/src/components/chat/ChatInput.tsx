import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, attachment?: { url: string; name: string; type: 'image' | 'file' }) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Ketik pesan...',
  maxLength = 2000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{
    url: string;
    name: string;
    type: 'image' | 'file';
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(() => {
    onTyping?.();
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 3000);
  }, [onTyping, onStopTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      if (value.trim()) {
        handleTyping();
      } else {
        onStopTyping?.();
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;
    if (disabled || isUploading) return;

    const text = message.trim();
    const attach = attachment;

    setMessage('');
    setAttachment(null);
    onStopTyping?.();

    await onSend(text, attach || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'file'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/chat/attachments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      setAttachment({
        url: data.url,
        name: data.name || file.name,
        type,
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          {attachment.type === 'image' ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-slate-500 capitalize">{attachment.type}</p>
          </div>
          <button
            onClick={removeAttachment}
            className="p-1 hover:bg-slate-200 rounded-full"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Buttons */}
        <div className="flex items-center gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Image className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            rows={1}
            className={cn(
              'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl resize-none',
              'focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'max-h-32 overflow-y-auto'
            )}
            style={{ minHeight: '44px' }}
          />
          <span className="absolute right-3 bottom-2 text-xs text-slate-400">
            {message.length}/{maxLength}
          </span>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || isUploading || (!message.trim() && !attachment)}
          className={cn(
            'p-2.5 rounded-2xl transition-colors',
            message.trim() || attachment
              ? 'bg-nu-green text-white hover:bg-nu-green/90'
              : 'bg-slate-100 text-slate-400',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;