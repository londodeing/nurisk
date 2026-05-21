import { useEffect, useState } from 'react';
import { TypingUser } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: TypingUser[];
  currentUserId?: string;
}

export function TypingIndicator({ users, currentUserId }: TypingIndicatorProps) {
  const [dots, setDots] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 3);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Filter out current user
  const otherUsers = users.filter((u) => u.userId !== currentUserId);

  if (otherUsers.length === 0) return null;

  const names = otherUsers.map((u) => u.userName);
  let text = '';

  if (names.length === 1) {
    text = `${names[0]} sedang mengetik`;
  } else if (names.length === 2) {
    text = `${names[0]} dan ${names[1]} sedang mengetik`;
  } else if (names.length === 3) {
    text = `${names[0]}, ${names[1]}, dan ${names[2]} sedang mengetik`;
  } else {
    text = `${names[0]} dan ${names.length - 1} lainnya sedang mengetik`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500">
      <div className="flex items-center gap-1">
        <span
          className={cn(
            'w-2 h-2 rounded-full bg-slate-400 transition-all',
            dots >= 0 && 'animate-bounce'
          )}
          style={{ animationDelay: '0ms' }}
        />
        <span
          className={cn(
            'w-2 h-2 rounded-full bg-slate-400 transition-all',
            dots >= 1 && 'animate-bounce'
          )}
          style={{ animationDelay: '150ms' }}
        />
        <span
          className={cn(
            'w-2 h-2 rounded-full bg-slate-400 transition-all',
            dots >= 2 && 'animate-bounce'
          )}
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="italic">{text}...</span>
    </div>
  );
}

export default TypingIndicator;