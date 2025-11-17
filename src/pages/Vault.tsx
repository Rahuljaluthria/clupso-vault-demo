import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, User, Activity, Monitor, Crown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DirectoryCard from '@/components/vault/DirectoryCard';
import CredentialCard from '@/components/vault/CredentialCard';
import AddDirectoryDialog from '@/components/vault/AddDirectoryDialog';
import AddCredentialDialog from '@/components/vault/AddCredentialDialog';

export interface Directory {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Credential {
  id: string;
  directory_id: string;
  name: string;
  username: string;
  encrypted_password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const Vault = () => {
  const { user, otpVerified, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDirectory, setShowAddDirectory] = useState(false);
  const [showAddCredential, setShowAddCredential] = useState(false);

  // Wait for auth to load before checking user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const loadVaultData = async () => {
    // Don't load if auth is still loading or user not authenticated
    if (authLoading || !user) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return; // Auth context will handle redirect
      }

      // Load directories
      const dirResponse = await fetch('https://clupso-backend.onrender.com/api/vault/directories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!dirResponse.ok) {
        throw new Error('Failed to load directories');
      }

      const dirData = await dirResponse.json();

      if (dirData && dirData.length > 0) {
        setDirectories(dirData.map((dir: any) => ({
          id: dir._id,
          name: dir.name,
          icon: dir.icon,
          created_at: dir.createdAt
        })));
        setSelectedDirectory(dirData[0]._id);
      }

      // Load credentials
      const credResponse = await fetch('https://clupso-backend.onrender.com/api/vault/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (credResponse.ok) {
        const credData = await credResponse.json();
        setCredentials(credData.map((cred: any) => ({
          id: cred._id,
          directory_id: cred.directoryId,
          name: cred.name,
          username: cred.username,
          encrypted_password: cred.encryptedPassword,
          url: cred.url,
          notes: cred.notes,
          created_at: cred.createdAt,
          updated_at: cred.updatedAt || cred.createdAt
        })));
      }
    } catch (error) {
      console.error('Error loading vault:', error);
      toast.error('Failed to load vault data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) {
      return;
    }

    if (!user || !otpVerified) {
      navigate('/login');
      return;
    }

    loadVaultData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, otpVerified, navigate, authLoading]);

  const handleDirectoryAdded = () => {
    loadVaultData();
  };

  const handleCredentialAdded = () => {
    loadVaultData();
  };

  const handleDirectoryDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://clupso-backend.onrender.com/api/vault/directories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete directory');
      }

      toast.success('Directory deleted successfully');
      if (selectedDirectory === id) {
        setSelectedDirectory(null);
      }
      loadVaultData();
    } catch (error) {
      toast.error('Failed to delete directory');
      console.error(error);
    }
  };

  const handleCredentialDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://clupso-backend.onrender.com/api/vault/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete credential');
      }

      toast.success('Credential deleted successfully');
      loadVaultData();
    } catch (error) {
      toast.error('Failed to delete credential');
      console.error(error);
    }
  };

  const filteredCredentials = selectedDirectory
    ? credentials.filter((c) => c.directory_id === selectedDirectory)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 
              className="text-3xl md:text-4xl font-bold text-glow mb-2 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => {
                setLoading(true);
                loadVaultData().finally(() => setLoading(false));
              }}
            >
              CLUPSO Vault
            </h1>
            <p className="text-muted-foreground">Secure Password Manager</p>
          </div>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="" alt={user?.email || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info('Avatar settings coming soon!')}>
                <User className="mr-2 h-4 w-4" />
                <span>Avatar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/activity')}>
                <Activity className="mr-2 h-4 w-4" />
                <span>Activity</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/trusted-devices')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>Trusted Devices</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/subscription')}>
                <Crown className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Directories */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Directories</h2>
              <Button
                onClick={() => setShowAddDirectory(true)}
                size="sm"
                className="gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Directory
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {directories.map((dir) => (
                <DirectoryCard
                  key={dir.id}
                    directory={dir}
                    isSelected={selectedDirectory === dir.id}
                    onClick={() => setSelectedDirectory(dir.id)}
                    onDelete={handleDirectoryDelete}
                    credentialCount={credentials.filter((c) => c.directory_id === dir.id).length}
                  />
                ))}
              </div>
            </div>

            {/* Credentials */}
            {selectedDirectory && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Credentials</h2>
                  <Button
                    onClick={() => setShowAddCredential(true)}
                    size="sm"
                    className="gradient-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Credential
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCredentials.map((cred) => (
                    <CredentialCard 
                      key={cred.id} 
                      credential={cred} 
                      onUpdate={loadVaultData}
                      onDelete={handleCredentialDelete}
                    />
                  ))}
                </div>
                {filteredCredentials.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No credentials in this directory yet
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <AddDirectoryDialog
        open={showAddDirectory}
        onOpenChange={setShowAddDirectory}
        onSuccess={handleDirectoryAdded}
      />
      <AddCredentialDialog
        open={showAddCredential}
        onOpenChange={setShowAddCredential}
        directoryId={selectedDirectory}
        onSuccess={handleCredentialAdded}
      />
    </div>
  );
};

export default Vault;

