import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  content: string;
  model?: string;
  usage?: any;
}

export function useOpenRouter() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = useCallback(async (
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4-turbo'
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    
    try {
      console.log('Calling OpenRouter Edge Function with messages:', messages.length, 'model:', model);
      
      // Call the Supabase Edge Function instead of OpenRouter directly
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages,
          model
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data) {
        throw new Error('No response from AI service');
      }

      const response = data as OpenRouterResponse;
      
      if (!response.content) {
        throw new Error('Invalid response from AI service');
      }

      console.log('OpenRouter response received via Edge Function');
      return response.content;
      
    } catch (error) {
      console.error('Error calling OpenRouter via Edge Function:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    sendMessage,
    isLoading
  };
}