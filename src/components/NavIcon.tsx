import type { View } from '../types';

interface NavIconProps {
  view: View;
  size?: number;
}

export function NavIcon({ view, size = 22 }: NavIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (view) {
    case 'workout':
      return (
        <svg {...props}>
          <path d="M6.5 6.5h11v11h-11z" />
          <path d="M9 6.5V4M15 6.5V4M9 17.5v2.5M15 17.5v2.5M6.5 9H4M6.5 15H4M17.5 9H20M17.5 15H20" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'warmups':
      return (
        <svg {...props}>
          <path d="M12 3c-1.5 3-4 4.5-4 8a4 4 0 0 0 8 0c0-3.5-2.5-5-4-8z" />
          <path d="M12 15v4" />
        </svg>
      );
    case 'weight':
      return (
        <svg {...props}>
          <path d="M12 3v18" />
          <path d="M8 7h8" />
          <path d="M6 21h12" />
          <path d="M5 7 3 9v6l2 2M19 7l2 2v6l-2 2" />
        </svg>
      );
    case 'library':
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    default:
      return null;
  }
}
