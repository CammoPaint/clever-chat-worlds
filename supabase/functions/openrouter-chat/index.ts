import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: OpenRouterMessage[];
  model: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { messages, model }: ChatRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's OpenRouter API key from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('openrouter_api_key')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.openrouter_api_key) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not found. Please add it in Settings.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Making OpenRouter request with model:', model);

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.openrouter_api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chat-worlds.lovableproject.com',
        'X-Title': 'Chat Worlds'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', openRouterResponse.status, errorText);
      
      let errorMessage = 'OpenRouter API error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Use default error message if parsing fails
      }
      
      return new Response(
        JSON.stringify({ error: `${errorMessage} (${openRouterResponse.status})` }),
        { 
          status: openRouterResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseData = await openRouterResponse.json();
    console.log('OpenRouter response received');

    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      console.error('Invalid OpenRouter response structure:', responseData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenRouter API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the response content
    return new Response(
      JSON.stringify({ 
        content: responseData.choices[0].message.content,
        model: responseData.model,
        usage: responseData.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});