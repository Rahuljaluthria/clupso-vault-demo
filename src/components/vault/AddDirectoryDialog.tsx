import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mongoClient } from '@/lib/mongodb-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AddDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ICON_OPTIONS = ['📧', '📱', '🏦', '💼', '🔑', '🌐', '🎮', '🛒', '💳'];

const AddDirectoryDialog = ({ open, onOpenChange, onSuccess }: AddDirectoryDialogProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch('https://clupso-backend.onrender.com/api/vault/directories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          icon: selectedIcon,
          description: ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create directory');
      }

      toast.success('Directory created successfully');
      setName('');
      setSelectedIcon('📁');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating directory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create directory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Directory</DialogTitle>
          <DialogDescription>Add a new directory to organize your credentials</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Directory Name</Label>
            <Input
              id="name"
              placeholder="e.g., Work Accounts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`text-3xl p-3 rounded border transition-all ${
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Directory'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDirectoryDialog;
