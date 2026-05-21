import { cn } from '@/lib/utils';
import type { WeatherCondition } from '@/services/weatherService';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const EMOJI_MAP: Record<WeatherCondition, string> = {
  clear: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rain: '🌧️',
  thunderstorm: '⛈️',
  fog: '🌫️',
  wind: '💨',
  unknown: '🌤️',
};

const ANIMATION_CLASSES: Record<WeatherCondition, string> = {
  clear: '',
  partly_cloudy: 'animate-pulse',
  cloudy: '',
  rain: 'animate-bounce',
  thunderstorm: 'animate-pulse',
  fog: 'animate-pulse',
  wind: 'animate-spin',
  unknown: '',
};

export function WeatherIcon({
  condition,
  size = 'md',
  className,
  animated = false,
}: WeatherIconProps) {
  const emoji = EMOJI_MAP[condition] || '🌤️';
  const animationClass = animated ? ANIMATION_CLASSES[condition] : '';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        SIZE_CLASSES[size],
        animationClass,
        className
      )}
      role="img"
      aria-label={condition}
    >
      {emoji}
    </span>
  );
}

// SVG-based weather icons for more professional look
interface WeatherIconSvgProps {
  condition: WeatherCondition;
  className?: string;
  showBackground?: boolean;
}

const SVG_ICONS: Record<WeatherCondition, React.ReactNode> = {
  clear: (
    <g>
      <circle cx="12" cy="12" r="5" fill="#fbbf24" />
      <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </g>
  ),
  partly_cloudy: (
    <g>
      <circle cx="6" cy="10" r="4" fill="#fbbf24" />
      <path
        d="M13 18h5a3 3 0 0 0 .75-5.83A5 5 0 0 0 13 6a4 4 0 0 0-3 6.42V14h3a2 2 0 0 1 0 4z"
        fill="#94a3b8"
      />
    </g>
  ),
  cloudy: (
    <g>
      <path
        d="M17 18a4 4 0 0 0 0-8h-1a3 3 0 0 0-2.75 1.75A4 4 0 0 0 8 10a4 4 0 0 0 0 8h9z"
        fill="#94a3b8"
      />
    </g>
  ),
  rain: (
    <g>
      <path
        d="M17 14a4 4 0 0 0 0-8h-1a3 3 0 0 0-2.75 1.75A4 4 0 0 0 8 6a4 4 0 0 0 0 8h9z"
        fill="#64748b"
      />
      <g stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="20" x2="8" y2="24" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="16" y1="20" x2="16" y2="24" />
      </g>
    </g>
  ),
  thunderstorm: (
    <g>
      <path
        d="M17 12a4 4 0 0 0 0-8h-1a3 3 0 0 0-2.75 1.75A4 4 0 0 0 8 4a4 4 0 0 0 0 8h9z"
        fill="#475569"
      />
      <path
        d="M13 18l-2 4h4l-2 4"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  fog: (
    <g fill="#94a3b8">
      <ellipse cx="6" cy="10" rx="5" ry="2" />
      <ellipse cx="12" cy="14" rx="5" ry="2" />
      <ellipse cx="9" cy="18" rx="5" ry="2" />
    </g>
  ),
  wind: (
    <g stroke="#64748b" strokeWidth="2" strokeLinecap="round">
      <path d="M2 8h12a3 3 0 0 1 0 6H2" fill="none" />
      <path d="M2 4h8a2 2 0 0 1 0 4H2" fill="none" />
      <path d="M2 12h5a2 2 0 0 1 0 4H2" fill="none" />
    </g>
  ),
  unknown: (
    <g>
      <circle cx="12" cy="12" r="5" fill="#94a3b8" />
    </g>
  ),
};

export function WeatherIconSvg({
  condition,
  className,
  showBackground = false,
}: WeatherIconSvgProps) {
  const icon = SVG_ICONS[condition] || SVG_ICONS.unknown;

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        SIZE_CLASSES.md,
        showBackground && 'bg-slate-100 rounded-full p-1',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icon}
    </svg>
  );
}