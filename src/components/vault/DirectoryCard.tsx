import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Directory } from '@/pages/Vault';

interface DirectoryCardProps {
  directory: Directory;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  credentialCount: number;
}

const DirectoryCard = ({ directory, isSelected, onClick, onDelete, credentialCount }: DirectoryCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(directory.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`p-6 cursor-pointer transition-all duration-300 ${
            isSelected
              ? 'gradient-card border-primary shadow-glow'
              : 'gradient-card border-border hover:border-primary/50'
          }`}
          onClick={onClick}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">{directory.icon || <Folder className="w-10 h-10 text-primary" />}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{directory.name}</h3>
              <p className="text-sm text-muted-foreground">
                {credentialCount} {credentialCount === 1 ? 'credential' : 'credentials'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Directory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{directory.name}"? This will also delete all {credentialCount} credential{credentialCount !== 1 ? 's' : ''} inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DirectoryCard;
