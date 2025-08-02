import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Save } from 'lucide-react';

interface CustomModel {
  id: string;
  name: string;
  model_id: string;
  provider: string;
  description?: string;
}

interface EditCustomModelDialogProps {
  model: CustomModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCustomModelDialog = ({ model, open, onOpenChange }: EditCustomModelDialogProps) => {
  const { toast } = useToast();
  const { updateCustomModel, deleteCustomModel } = useCustomModels();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: model.name,
    model_id: model.model_id,
    provider: model.provider,
    description: model.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.model_id || !formData.provider) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateCustomModel(model.id, {
        name: formData.name,
        model_id: formData.model_id,
        provider: formData.provider,
        description: formData.description || undefined,
      });

      toast({
        title: "Success",
        description: "Custom model updated successfully!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating custom model:', error);
      toast({
        title: "Error",
        description: "Failed to update custom model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this custom model? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteCustomModel(model.id);
      toast({
        title: "Success",
        description: "Custom model deleted successfully!",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting custom model:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Custom Model</DialogTitle>
          <DialogDescription>
            Update the details of your custom model or delete it.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Model Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., GPT-4 Custom"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-model-id">Model ID *</Label>
            <Input
              id="edit-model-id"
              value={formData.model_id}
              onChange={(e) => setFormData(prev => ({ ...prev, model_id: e.target.value }))}
              placeholder="e.g., openai/gpt-4"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-provider">Provider *</Label>
            <Input
              id="edit-provider"
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
              placeholder="e.g., OpenAI"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of the model..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Model
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};