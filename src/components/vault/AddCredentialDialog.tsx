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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { encryptPassword } from '@/lib/encryption';

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directoryId: string | null;
  onSuccess: () => void;
}

const AddCredentialDialog = ({
  open,
  onOpenChange,
  directoryId,
  onSuccess,
}: AddCredentialDialogProps) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !directoryId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in again');
        return;
      }

      const encryptedPwd = encryptPassword(password);

      const response = await fetch('https://clupso-backend.onrender.com/api/vault/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          directoryId,
          title: name,
          username,
          password: encryptedPwd,
          url: url || '',
          notes: notes || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create credential');
      }

      toast.success('Credential added successfully');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating credential:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setUrl('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>Store a new encrypted credential in your vault</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cred-name">Name</Label>
            <Input
              id="cred-name"
              placeholder="e.g., Gmail"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              placeholder="username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Will be encrypted with AES-256 before storage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (Optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Credential'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredentialDialog;
