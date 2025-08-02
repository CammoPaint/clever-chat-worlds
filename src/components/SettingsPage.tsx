import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Cpu, Save, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomModels } from '@/hooks/useCustomModels';
import { AddCustomModelDialog } from '@/components/AddCustomModelDialog';

interface Model {
  id: string;
  name: string;
  provider: string;
  context_length: number;
}

export const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { customModels, isLoading: customModelsLoading, deleteCustomModel } = useCustomModels();

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadAvailableModels();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('openrouter_api_key')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data?.openrouter_api_key) {
        setApiKey(data.openrouter_api_key);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadAvailableModels = async () => {
    // Mock data for now - in a real app, this would fetch from OpenRouter API
    const mockModels: Model[] = [
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        context_length: 128000
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        context_length: 128000
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        context_length: 200000
      },
      {
        id: 'meta-llama/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B',
        provider: 'Meta',
        context_length: 131072
      }
    ];
    setModels(mockModels);
  };

  const saveApiKey = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          openrouter_api_key: apiKey
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving API key:', error);
        toast({
          title: "Error",
          description: "Failed to save API key. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "OpenRouter API key saved successfully!",
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `API key is valid! Found ${data.data?.length || 0} available models.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid API key. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: "Error",
        description: "Failed to test API key. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatContextLength = (length: number) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K`;
    }
    return length.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your OpenRouter API key and model preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                OpenRouter API Key
              </CardTitle>
              <CardDescription>
                Enter your OpenRouter API key to access AI models. You can get one from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenRouter.ai
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveApiKey} 
                  disabled={isSaving || !apiKey}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save API Key'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testApiKey} 
                  disabled={isLoading || !apiKey}
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Custom Models Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Your Custom Models
                </div>
                <AddCustomModelDialog
                  trigger={
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Custom Model
                    </Button>
                  }
                />
              </CardTitle>
              <CardDescription>
                Manage your custom AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customModelsLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading custom models...
                </div>
              ) : customModels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Cpu className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No custom models yet</p>
                  <p className="text-sm mb-4">
                    Add your own AI models to expand your options
                  </p>
                  <AddCustomModelDialog
                    trigger={
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Model
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-3">
                  {customModels.map((model) => (
                    <div 
                      key={model.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{model.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {model.provider}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                        {model.description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {model.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">
                          {model.model_id}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomModel(model.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Available Models Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Available Models
              </CardTitle>
              <CardDescription>
                Popular models available through OpenRouter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {models.map((model) => (
                  <div 
                    key={model.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{model.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Context: {formatContextLength(model.context_length)} tokens
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {model.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
              <CardDescription>
                How to use OpenRouter with this chat application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Getting Started</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Sign up for an account at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter.ai</a></li>
                  <li>Generate an API key from your <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">API Keys page</a></li>
                  <li>Enter your API key above and save it</li>
                  <li>Start chatting with any of the available AI models</li>
                </ol>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Pricing</h4>
                <p className="text-sm">
                  OpenRouter uses a pay-per-use model. You'll only be charged for what you use, 
                  with transparent pricing per token. Check their{' '}
                  <a href="https://openrouter.ai/docs#models" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    pricing page
                  </a>{' '}
                  for current rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};