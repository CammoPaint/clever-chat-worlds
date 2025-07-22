import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { useThreads, type Thread } from '@/hooks/useThreads';

const Index = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { threads, currentThread, setCurrentThread, createThread, loadThreads } = useThreads();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleSelectThread = (thread: Thread) => {
    setCurrentThread(thread);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewThread = async () => {
    const newThread = await createThread();
    if (newThread) {
      setCurrentThread(newThread);
    }
    setSidebarOpen(false);
  };

  const handleThreadUpdate = () => {
    // The useThreads hook already handles updating both threads array 
    // and currentThread state when updateThread is called
    // No additional action needed here
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
        threads={threads}
        currentThread={currentThread}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea 
          onToggleSidebar={toggleSidebar}
          currentThread={currentThread}
          onThreadUpdate={handleThreadUpdate}
        />
      </div>
    </div>
  );
};

export default Index;
