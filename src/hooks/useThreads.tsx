import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Thread {
  id: string;
  title: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load threads for the current user
  const loadThreads = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading threads:', error);
        toast.error('Failed to load conversations');
        return;
      }

      setThreads(data || []);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new thread
  const createThread = async (title: string = 'New Conversation') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('threads')
        .insert({
          title,
          user_id: user.id,
          system_prompt: 'You are a helpful assistant.'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating thread:', error);
        toast.error('Failed to create conversation');
        return null;
      }

      setThreads(prev => [data, ...prev]);
      setCurrentThread(data);
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  // Update thread title
  const updateThread = async (threadId: string, updates: Partial<Thread>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('threads')
        .update(updates)
        .eq('id', threadId)
        .select()
        .single();

      if (error) {
        console.error('Error updating thread:', error);
        toast.error('Failed to update conversation');
        return;
      }

      setThreads(prev => prev.map(t => t.id === threadId ? data : t));
      if (currentThread?.id === threadId) {
        setCurrentThread(data);
      }
    } catch (error) {
      console.error('Error updating thread:', error);
      toast.error('Failed to update conversation');
    }
  };

  // Delete a thread
  const deleteThread = async (threadId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        console.error('Error deleting thread:', error);
        toast.error('Failed to delete conversation');
        return;
      }

      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Load threads when user changes
  useEffect(() => {
    if (user) {
      loadThreads();
    } else {
      setThreads([]);
      setCurrentThread(null);
    }
  }, [user]);

  return {
    threads,
    currentThread,
    setCurrentThread,
    isLoading,
    createThread,
    updateThread,
    deleteThread,
    loadThreads,
  };
}