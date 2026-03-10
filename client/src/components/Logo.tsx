interface Props {
  size?: number;
  withText?: boolean;
  textSize?: number;
}

export default function Logo({ size = 36, withText = true, textSize = 20 }: Props) {
  const id = `logo-grad-${size}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b537f2" />
            <stop offset="100%" stopColor="#f72585" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z"
          fill={`url(#${id})`}
          filter={`url(#${id}-glow)`}
        />
        <path
          d="M20 32 L28 41 L45 23"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {withText && (
        <span style={{
          fontWeight: 900,
          fontSize: textSize,
          background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          filter: 'drop-shadow(0 0 8px rgba(181,55,242,0.45))',
          lineHeight: 1,
        }}>
          LifeAdmin
        </span>
      )}
    </div>
  );
}
