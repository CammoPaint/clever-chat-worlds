-- Create custom_models table for user-defined models
CREATE TABLE public.custom_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_models ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom models" 
ON public.custom_models 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom models" 
ON public.custom_models 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom models" 
ON public.custom_models 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom models" 
ON public.custom_models 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_models_updated_at
BEFORE UPDATE ON public.custom_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();