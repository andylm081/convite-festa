import React, { useEffect, useRef } from 'react';
import twemoji from 'twemoji';

// Standardized emoji component using Twemoji (Twitter) - renders identically on ALL platforms
export function Emoji({ symbol, size = '1.2em', label = '', style = {} }) {
  if (!symbol) return null;
  // Build Twemoji SVG URL
  const codePoint = twemoji.convert.toCodePoint(
    symbol.indexOf('\u200D') < 0 ? symbol.replace(/\uFE0F/g, '') : symbol
  );
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
  return (
    <img
      src={url}
      alt={label || symbol}
      draggable={false}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: '-0.15em',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// Wrapper that auto-parses all emoji text inside it using Twemoji
export function TwemojiText({ children, className = '', style = {}, as: Tag = 'span' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
        className: 'twemoji',
      });
    }
  });
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
