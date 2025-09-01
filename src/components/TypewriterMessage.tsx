import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface TypewriterMessageProps {
  content: string;
  onComplete?: () => void;
  speed?: number; // 打字速度（毫秒）
  className?: string;
}

interface StreamingMessageProps {
  messageId: string;
  sessionId?: string;
  onComplete?: () => void;
  className?: string;
}

/**
 * 打字机效果组件 - 用于显示预设内容的打字机效果
 */
export function TypewriterMessage({ 
  content, 
  onComplete, 
  speed = 50, 
  className = '' 
}: TypewriterMessageProps) {
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
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex-1 bg-gray-50 rounded-lg p-4">
        <div className="text-gray-800 whitespace-pre-wrap">
          {displayedContent}
          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 流式消息组件 - 通过SSE接收流式数据并显示打字机效果
 */
export function StreamingMessage({ 
  messageId, 
  sessionId, 
  onComplete, 
  className = '' 
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToStream = () => {
      try {
        // 构建SSE连接URL
        const url = new URL('/api/diagnosis/chat/stream', window.location.origin);
        url.searchParams.set('message', messageId);
        if (sessionId) {
          url.searchParams.set('sessionId', sessionId);
        }

        eventSource = new EventSource(url.toString());
        setIsConnecting(true);
        setError(null);

        eventSource.onopen = () => {
          setIsConnecting(false);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'content') {
              setDisplayedContent(prev => prev + data.content);
            } else if (data.type === 'complete') {
              setIsComplete(true);
              eventSource?.close();
              onComplete?.();
            } else if (data.error) {
              setError(data.error);
              eventSource?.close();
            }
          } catch (err) {
            console.error('解析SSE数据失败:', err);
          }
        };

        eventSource.onerror = (event) => {
          console.error('SSE连接错误:', event);
          setError('连接服务器失败，请稍后重试');
          setIsConnecting(false);
          eventSource?.close();
        };

      } catch (err) {
        console.error('创建SSE连接失败:', err);
        setError('无法建立连接');
        setIsConnecting(false);
      }
    };

    connectToStream();

    return () => {
      eventSource?.close();
    };
  }, [messageId, sessionId, onComplete]);

  if (error) {
    return (
      <div className={`flex items-start space-x-3 ${className}`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex-1 bg-gray-50 rounded-lg p-4">
        {isConnecting ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="ml-2">正在连接...</span>
          </div>
        ) : (
          <div className="text-gray-800 whitespace-pre-wrap">
            {displayedContent}
            {!isComplete && (
              <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TypewriterMessage;