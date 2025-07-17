import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';

const Index = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>('1');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewThread = () => {
    setSelectedThread(null);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-gradient-background overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        selectedThread={selectedThread}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea 
          onToggleSidebar={toggleSidebar}
          threadTitle={selectedThread ? 'Getting started with OpenRouter' : 'New Conversation'}
        />
      </div>
    </div>
  );
};

export default Index;
