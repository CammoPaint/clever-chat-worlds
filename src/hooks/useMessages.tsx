import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  model_id?: string;
  created_at: string;
  thread_id: string;
}

export function useMessages(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load messages for a thread
  const loadMessages = async () => {
    if (!threadId || !user) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Save a message to the database
  const saveMessage = async (content: string, role: 'user' | 'assistant', modelId?: string) => {
    if (!threadId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          role,
          model_id: modelId,
          thread_id: threadId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        toast.error('Failed to save message');
        return null;
      }

      setMessages(prev => [...prev, data as Message]);
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
      return null;
    }
  };

  // Add a message to local state (for immediate UI updates)
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Update a message in local state
  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...updates } : m));
  };

  // Load messages when thread changes
  useEffect(() => {
    loadMessages();
  }, [threadId, user]);

  return {
    messages,
    isLoading,
    saveMessage,
    addMessage,
    updateMessage,
    loadMessages,
  };
}