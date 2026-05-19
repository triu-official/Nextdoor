import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './App';
import { OnboardingPage } from './pages/OnboardingPage';
import { LocalFeedPage } from './pages/LocalFeedPage';
import { NewNearbyPage } from './pages/NewNearbyPage';
import { CommunityCirclesPage } from './pages/CommunityCirclesPage';
import { PostDetailPage } from './pages/PostDetailPage';

export const router = createBrowserRouter([
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: 'feed', element: <LocalFeedPage /> },
      { path: 'feed/:postId', element: <PostDetailPage /> },
      { path: 'nearby', element: <NewNearbyPage /> },
      { path: 'circles', element: <CommunityCirclesPage /> }
    ]
  }
]);
