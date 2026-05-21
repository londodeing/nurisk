import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  CheckCheck,
  File,
  Download,
  MoreVertical,
  Reply,
  Copy,
  Trash2,
} from 'lucide-react';
import { Message } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  showTimestamp?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender = true,
  showTimestamp = true,
  isFirst = false,
  isLast = false,
  onReply,
  onDelete,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isRead = message.readBy && message.readBy.length > 0;
  const hasAttachment = message.type !== 'text';

  return (
    <div
      className={cn(
        'group flex flex-col max-w-[75%]',
        isOwn ? 'items-end ml-auto' : 'items-start'
      )}
    >
      {/* Sender Name (for others) */}
      {!isOwn && showSender && isFirst && (
        <p className="text-xs font-medium text-amber-600 mb-1 ml-3">
          {message.senderName}
        </p>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          'relative rounded-2xl px-4 py-2.5 max-w-full',
          isOwn
            ? 'bg-nu-green text-white rounded-br-md'
            : 'bg-slate-100 text-slate-700 rounded-bl-md',
          !isFirst && !isOwn && 'rounded-tl-md',
          !isLast && !isOwn && 'rounded-tr-md'
        )}
      >
        {/* Attachment */}
        {hasAttachment && (
          <div className="mb-2">
            {message.type === 'image' ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={message.mediaUrl}
                  alt={message.fileName || 'Image'}
                  className="max-w-full max-h-48 object-cover"
                />
                {message.fileName && (
                  <p className={cn('text-xs mt-1', isOwn ? 'text-white/70' : 'text-slate-500')}>
                    {message.fileName}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  isOwn ? 'bg-white/10' : 'bg-slate-200'
                )}
              >
                <File
                  className={cn('w-5 h-5', isOwn ? 'text-white' : 'text-slate-500')}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isOwn ? 'text-white' : 'text-slate-700'
                    )}
                  >
                    {message.fileName || 'File'}
                  </p>
                  <Link
                    to={message.mediaUrl}
                    className={cn(
                      'text-xs flex items-center gap-1',
                      isOwn ? 'text-white/70' : 'text-slate-500'
                    )}
                    target="_blank"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Text */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

        {/* Timestamp & Read Status */}
        {showTimestamp && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isOwn ? 'text-white/70 justify-end' : 'text-slate-400'
            )}
          >
            <span className="text-[10px]">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <span className="text-[10px]">
                {isRead ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
        )}

        {/* Context Menu */}
        <div
          className={cn(
            'absolute top-0',
            isOwn ? '-left-10' : '-right-10',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              'p-1.5 rounded-full',
              isOwn ? 'hover:bg-white/10' : 'hover:bg-slate-200'
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div
              className={cn(
                'absolute top-full mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[120px]',
                isOwn ? 'right-0' : 'left-0',
                isOwn ? 'bg-slate-700' : 'bg-white border border-slate-200'
              )}
            >
              <button
                onClick={() => {
                  onReply?.(message);
                  setShowMenu(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm',
                  isOwn ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button
                onClick={() => {
                  handleCopy();
                  setShowMenu(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm',
                  isOwn ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {isOwn && (
                <button
                  onClick={() => {
                    onDelete?.(message);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;