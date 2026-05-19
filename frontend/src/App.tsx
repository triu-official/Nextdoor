import { Outlet, Navigate } from 'react-router-dom';
import { useUserContext } from './context/UserContext';
import { TabBar } from './components/TabBar';

export function AppLayout() {
  const { user } = useUserContext();

  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
