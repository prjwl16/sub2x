export const theme = {
  colors: {
    background: '#F7F8FB',
    glass: {
      background: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.6)',
    },
    accent: {
      from: '#6366f1', // indigo-500
      to: '#8b5cf6',   // violet-500
    },
    text: {
      primary: '#1f2937',   // gray-800
      secondary: '#6b7280', // gray-500
      muted: '#9ca3af',     // gray-400
    }
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  borderRadius: {
    card: '1rem',
    button: '0.5rem',
  }
} as const;
