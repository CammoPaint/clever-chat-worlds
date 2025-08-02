import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useMessages, type Message } from '@/hooks/useMessages';
import { useThreads, type Thread } from '@/hooks/useThreads';
import { toast } from 'sonner';

interface ChatAreaProps {
  onToggleSidebar: () => void;
  currentThread?: Thread | null;
  onThreadUpdate?: () => void;
}

export function ChatArea({ onToggleSidebar, currentThread, onThreadUpdate }: ChatAreaProps) {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4-turbo');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const { sendMessage: sendOpenRouterMessage, isLoading } = useOpenRouter();
  const { messages, saveMessage } = useMessages(currentThread?.id || null);
  const { updateThread, deleteThread, createThread } = useThreads();
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

  const handleRenameThread = () => {
    if (!currentThread) return;
    setNewThreadTitle(currentThread.title);
    setShowRenameDialog(true);
  };

  const handleDeleteThread = () => {
    setShowDeleteDialog(true);
  };

  const confirmRename = async () => {
    if (!currentThread || !newThreadTitle.trim()) return;
    
    await updateThread(currentThread.id, { title: newThreadTitle.trim() });
    setShowRenameDialog(false);
    setNewThreadTitle('');
    onThreadUpdate?.();
  };

  const confirmDelete = async () => {
    if (!currentThread) return;
    
    await deleteThread(currentThread.id);
    setShowDeleteDialog(false);
    onThreadUpdate?.();
  };

  const handleSendMessage = async (content: string) => {
    let threadToUse = currentThread;
    
    // If no current thread exists, create a new one automatically
    if (!threadToUse) {
      // Generate a title from the first few words of the message
      const title = content.length > 50 
        ? content.substring(0, 47) + '...' 
        : content || 'New Conversation';
      
      threadToUse = await createThread(title);
      
      if (!threadToUse) {
        toast.error('Failed to create conversation');
        return;
      }
      
      // Notify parent to update the thread list and set current thread
      onThreadUpdate?.();
    }

    try {
      // Save user message to database
      await saveMessage(content, 'user');

      // Convert messages to OpenRouter format
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      chatHistory.push({
        role: 'user' as const,
        content
      });

      // Get AI response
      const responseContent = await sendOpenRouterMessage(chatHistory, selectedModel);
      
      // Save AI response to database
      await saveMessage(responseContent, 'assistant', selectedModel);
      
      // Update thread's updated_at timestamp
      await updateThread(threadToUse.id, { updated_at: new Date().toISOString() });
      onThreadUpdate?.();
    } catch (error) {
      console.error('Error sending message:', error);
      // Save error message to database for user to see
      await saveMessage(
        "Sorry, I encountered an error. Please check that your OpenRouter API key is configured correctly in Settings.",
        'assistant',
        selectedModel
      );
    }
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
            <h1 className="font-semibold text-foreground">{currentThread?.title || 'New Conversation'}</h1>
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
              <DropdownMenuItem onClick={handleRenameThread} className="hover:bg-muted">
                <Edit2 className="h-4 w-4 mr-2" />
                Rename Thread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteThread} className="hover:bg-muted text-destructive">
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
                  Start typing your message below to begin a new conversation with your chosen AI model. Ask questions, get help with code, brainstorm ideas, or just chat!
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
                <ChatMessage 
                  key={message.id} 
                  message={{
                    id: message.id,
                    content: message.content,
                    sender: message.role,
                    timestamp: new Date(message.created_at),
                    model: message.model_id
                  }} 
                />
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
        disabled={false}
      />

      {/* Rename Thread Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename Conversation</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            placeholder="Conversation name"
            className="mt-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                confirmRename();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!newThreadTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Thread Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{currentThread?.title}"? This action cannot be undone and all messages in this conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}