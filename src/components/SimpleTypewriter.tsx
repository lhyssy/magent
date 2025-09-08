import React, { useState, useEffect } from 'react';

interface SimpleTypewriterProps {
  content: string;
  onComplete?: () => void;
  speed?: number; // 打字速度（毫秒）
  className?: string;
}

/**
 * 简化的打字机效果组件 - 只处理文本内容，不包含样式
 */
export function SimpleTypewriter({ 
  content, 
  onComplete, 
  speed = 30, 
  className = '' 
}: SimpleTypewriterProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, content, speed, onComplete, isComplete]);

  return (
    <span className={className}>
      {displayedContent}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-white ml-1 animate-pulse" />
      )}
    </span>
  );
}

export default SimpleTypewriter;