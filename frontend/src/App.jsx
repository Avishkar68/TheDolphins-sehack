import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const Layout = () => {
  return (
    <div className='font-inter bg-mainbg min-h-screen text-white'>
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true, // default route
        element: <Dashboard />, // Temporary default for testing
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;