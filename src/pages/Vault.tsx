import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import DirectoryCard from '@/components/vault/DirectoryCard';
import CredentialCard from '@/components/vault/CredentialCard';
import ActivityLog from '@/components/vault/ActivityLog';
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
  const { user, otpVerified, signOut } = useAuth();
  const navigate = useNavigate();
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDirectory, setShowAddDirectory] = useState(false);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);

  const loadVaultData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in again');
        navigate('/login');
        return;
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
          name: cred.title,
          username: cred.username,
          encrypted_password: cred.password,
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
    if (!user || !otpVerified) {
      navigate('/login');
      return;
    }

    loadVaultData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, otpVerified, navigate]);

  const handleDirectoryAdded = () => {
    loadVaultData();
    setActivityRefresh(prev => prev + 1);
  };

  const handleCredentialAdded = () => {
    loadVaultData();
    setActivityRefresh(prev => prev + 1);
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
      setActivityRefresh(prev => prev + 1);
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
      setActivityRefresh(prev => prev + 1);
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
            <h1 className="text-3xl md:text-4xl font-bold text-glow mb-2">CLUPSO Vault</h1>
            <p className="text-muted-foreground">Secure Password Manager</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="vault" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vault">Vault</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog key={activityRefresh} />
          </TabsContent>
        </Tabs>
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

