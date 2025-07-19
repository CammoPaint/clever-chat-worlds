import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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
      // Get user's API key
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('openrouter_api_key')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.openrouter_api_key) {
        throw new Error('OpenRouter API key not found. Please add it in Settings.');
      }

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.openrouter_api_key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Chat Worlds'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenRouter API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter:', error);
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