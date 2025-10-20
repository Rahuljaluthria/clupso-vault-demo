import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import type { Directory } from '@/pages/Vault';

interface DirectoryCardProps {
  directory: Directory;
  isSelected: boolean;
  onClick: () => void;
  credentialCount: number;
}

const DirectoryCard = ({ directory, isSelected, onClick, credentialCount }: DirectoryCardProps) => {
  return (
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
        </div>
      </Card>
    </motion.div>
  );
};

export default DirectoryCard;
