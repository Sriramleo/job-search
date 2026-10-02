import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Applications } from './pages/Applications';
import { ApplicationWorkspace } from './pages/ApplicationWorkspace';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Contacts } from './pages/Contacts';
import { Documents } from './pages/Documents';
import { Interviews } from './pages/Interviews';
import { Tasks } from './pages/Tasks';
import { Research } from './pages/Research';
import { Inbox } from './pages/Inbox';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Automation } from './pages/Automation';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />

            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationWorkspace />} />

            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />

            <Route path="contacts" element={<Contacts />} />
            <Route path="documents" element={<Documents />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="research" element={<Research />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="automation" element={<Automation />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
