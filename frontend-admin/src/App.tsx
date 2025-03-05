import { lazy } from 'react';
import { Routes, Route } from 'react-router';

import MainLayout from './layouts/Main';

const AuthLogin = lazy(() => import('./pages/auth/Login'));
const AuthLogout = lazy(() => import('./pages/auth/Logout'));
const Home = lazy(() => import('./pages/Home'));

// TODO: Add <Suspense /> components around here

export default function App() {
  return (
    <Routes>
      <Route path="admin">
        <Route path="auth/login" element={<AuthLogin />} />
        <Route path="auth/logout" element={<AuthLogout />} />

        <Route element={<MainLayout />}>
          <Route path="" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
