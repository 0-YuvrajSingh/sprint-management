import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Sprints from './pages/Sprints';
import Stories from './pages/Stories';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Users from './pages/Users';
import ActivityPage from './pages/Activity';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/projects',
            element: <Projects />,
          },
          {
            path: '/projects/:projectId',
            element: <ProjectDetail />,
          },
          {
            path: '/sprints',
            element: <Sprints />,
          },
          {
            path: '/stories',
            element: <Stories />,
          },
          {
            path: '/activity',
            element: <ActivityPage />,
          },
          {
            path: '/users',
            element: <Users />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);