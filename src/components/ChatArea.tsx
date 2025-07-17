import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { Button } from '@/components/ui/button';
import { Menu, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
}

interface ChatAreaProps {
  onToggleSidebar: () => void;
  threadTitle?: string;
}

export function ChatArea({ onToggleSidebar, threadTitle = 'New Conversation' }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you with a wide variety of tasks. What would you like to work on today?",
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      model: 'GPT-4',
    },
  ]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your message. This is a simulated response. Once you connect to Supabase and add your OpenRouter API key, I'll be able to provide real AI responses using the selected model!",
        sender: 'assistant',
        timestamp: new Date(),
        model: selectedModel,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden hover:bg-muted"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="font-semibold text-foreground">{threadTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {messages.length} messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel} 
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem className="hover:bg-muted">
                <Edit2 className="h-4 w-4 mr-2" />
                Rename Thread
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Thread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          {isEmpty ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <span className="text-2xl">🤖</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to Chat Worlds
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start a conversation with your chosen AI model. Ask questions, get help with code, brainstorm ideas, or just chat!
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="font-medium text-foreground">💡 Get Ideas</div>
                    <div className="text-muted-foreground">Brainstorm and explore</div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="font-medium text-foreground">🔍 Research</div>
                    <div className="text-muted-foreground">Find information</div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="font-medium text-foreground">💻 Code Help</div>
                    <div className="text-muted-foreground">Debug and optimize</div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="font-medium text-foreground">📝 Write</div>
                    <div className="text-muted-foreground">Create and edit</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="group">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 p-4 animate-fade-in bg-muted/30">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">{selectedModel}</span>
                      <span className="text-xs text-muted-foreground">thinking...</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
      />
    </div>
  );
}