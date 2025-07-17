import { useState } from 'react';
import { Send, Paperclip, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-gradient-card p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 hover:bg-muted"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={disabled || isLoading}
              className="
                min-h-[44px] max-h-32 pr-12 resize-none
                bg-input border-border focus:border-primary/50
                placeholder:text-muted-foreground
                transition-all duration-200
              "
            />
            
            {/* Voice input button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 bottom-1 hover:bg-muted"
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          {/* Send/Stop button */}
          <Button
            onClick={isLoading ? undefined : handleSend}
            disabled={(!message.trim() && !isLoading) || disabled}
            className={`
              mb-2 transition-all duration-200
              ${isLoading 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-gradient-primary hover:shadow-glow'
              }
            `}
          >
            {isLoading ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Character count or status */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <div>
            {isLoading && (
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                AI is thinking...
              </span>
            )}
          </div>
          <div>
            {message.length > 0 && `${message.length} characters`}
          </div>
        </div>
      </div>
    </div>
  );
}