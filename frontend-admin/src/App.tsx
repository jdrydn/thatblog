import { lazy } from 'react';
import { Routes, Route } from 'react-router';

import MainLayout from './layouts/Main';

const Home = lazy(() => import('./pages/Home'));

// TODO: Add <Suspense /> components around here

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}
