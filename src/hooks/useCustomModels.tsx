import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CustomModel {
  id: string;
  name: string;
  model_id: string;
  provider: string;
  description: string;
}

export function useCustomModels() {
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadCustomModels = async () => {
    if (!user) {
      setCustomModels([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomModels(data || []);
    } catch (error) {
      console.error('Error loading custom models:', error);
      toast.error('Failed to load custom models');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomModel = async (model: Omit<CustomModel, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add custom models');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('custom_models')
        .insert({
          user_id: user.id,
          name: model.name,
          model_id: model.model_id,
          provider: model.provider,
          description: model.description,
        })
        .select()
        .single();

      if (error) throw error;

      setCustomModels(prev => [data, ...prev]);
      toast.success('Custom model added successfully');
      return true;
    } catch (error) {
      console.error('Error adding custom model:', error);
      toast.error('Failed to add custom model');
      return false;
    }
  };

  const updateCustomModel = async (id: string, updates: Omit<CustomModel, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to update custom models');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('custom_models')
        .update({
          name: updates.name,
          model_id: updates.model_id,
          provider: updates.provider,
          description: updates.description,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCustomModels(prev => 
        prev.map(model => model.id === id ? data : model)
      );
      toast.success('Custom model updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating custom model:', error);
      toast.error('Failed to update custom model');
      return false;
    }
  };

  const deleteCustomModel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomModels(prev => prev.filter(model => model.id !== id));
      toast.success('Custom model deleted');
    } catch (error) {
      console.error('Error deleting custom model:', error);
      toast.error('Failed to delete custom model');
    }
  };

  useEffect(() => {
    loadCustomModels();
  }, [user]);

  return {
    customModels,
    isLoading,
    addCustomModel,
    updateCustomModel,
    deleteCustomModel,
    loadCustomModels,
  };
}