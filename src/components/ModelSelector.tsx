import { ChevronDown, Sparkles, Brain, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  tier: 'free' | 'premium' | 'enterprise';
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const models: Model[] = [
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable model for complex tasks',
    icon: <Sparkles className="h-4 w-4" />,
    tier: 'premium',
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Top reasoning and creative writing',
    icon: <Brain className="h-4 w-4" />,
    tier: 'premium',
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced model for reasoning and creativity',
    icon: <Brain className="h-4 w-4" />,
    tier: 'premium',
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient for most tasks',
    icon: <Zap className="h-4 w-4" />,
    tier: 'free',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    description: 'Google\'s advanced language model',
    icon: <Star className="h-4 w-4" />,
    tier: 'premium',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    description: 'Latest open-source model with strong capabilities',
    icon: <Zap className="h-4 w-4" />,
    tier: 'free',
  },
];

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free':
      return 'text-green-400';
    case 'premium':
      return 'text-primary';
    case 'enterprise':
      return 'text-yellow-400';
    default:
      return 'text-muted-foreground';
  }
};

const getTierBadge = (tier: string) => {
  switch (tier) {
    case 'free':
      return 'FREE';
    case 'premium':
      return 'PRO';
    case 'enterprise':
      return 'ENT';
    default:
      return '';
  }
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="min-w-[200px] justify-between bg-card border-border hover:bg-muted/50 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <div className={getTierColor(currentModel.tier)}>
              {currentModel.icon}
            </div>
            <div className="text-left">
              <div className="font-medium">{currentModel.name}</div>
              <div className="text-xs text-muted-foreground">{currentModel.provider}</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-popover border-border shadow-elegant"
        align="start"
      >
        <DropdownMenuLabel className="text-muted-foreground">
          Choose a Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`
              p-3 cursor-pointer transition-all duration-200
              ${selectedModel === model.id ? 'bg-primary/10' : 'hover:bg-muted/50'}
            `}
          >
            <div className="flex items-start gap-3 w-full">
              <div className={`${getTierColor(model.tier)} mt-1`}>
                {model.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getTierColor(model.tier)}`}>
                    {getTierBadge(model.tier)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {model.provider} • {model.description}
                </div>
              </div>
              {selectedModel === model.id && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground cursor-pointer hover:bg-muted/50">
          <Sparkles className="h-4 w-4 mr-2" />
          Add Custom Model
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}