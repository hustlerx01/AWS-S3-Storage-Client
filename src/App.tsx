import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { ConnectionForm } from './components/auth/ConnectionForm';
import { Layout } from './components/layout/Layout';
import { FileExplorer } from './components/dashboard/FileExplorer';
import { Toaster } from './components/ui/sonner';

function App() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen bg-black text-zinc-200 overflow-x-hidden">
      {isAuthenticated ? (
        <Layout>
          <FileExplorer />
        </Layout>
      ) : (
        <ConnectionForm />
      )}
      <Toaster />
    </div>
  );
}

export default App;
