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
    <>
      {isAuthenticated ? (
        <Layout>
          <FileExplorer />
        </Layout>
      ) : (
        <ConnectionForm />
      )}
      <Toaster />
    </>
  );
}

export default App;
