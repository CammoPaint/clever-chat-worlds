import { useState } from 'react';
import { Plus, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

interface Thread {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
}

export function Sidebar({ isOpen, onToggle, selectedThread, onSelectThread, onNewThread }: SidebarProps) {
  const [threads] = useState<Thread[]>([
    {
      id: '1',
      title: 'Getting started with OpenRouter',
      lastMessage: 'How do I use multiple models?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: '2', 
      title: 'Code review assistance',
      lastMessage: 'Can you help me optimize this function?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      id: '3',
      title: 'Creative writing project',
      lastMessage: 'I need help with character development',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          w-80 bg-gradient-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-elegant
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Chat Worlds</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewThread}
              className="hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden hover:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Threads list */}
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200
                  hover:bg-primary/10 group animate-fade-in
                  ${selectedThread === thread.id 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {thread.title}
                    </div>
                    {thread.lastMessage && (
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        {thread.lastMessage}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(thread.timestamp)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}