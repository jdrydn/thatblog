import { lazy } from 'react';
import { Routes, Route } from 'react-router';

import MainLayout from './layouts/Main';

const AuthLogin = lazy(() => import('./pages/auth/Login'));
const AuthLogout = lazy(() => import('./pages/auth/Logout'));
const Home = lazy(() => import('./pages/Home'));
const Editor = lazy(() => import('./pages/Editor'));

// TODO: Add <Suspense /> components around routes

export default function App() {
  return (
    <Routes>
      <Route path="admin">
        <Route path="auth/login" element={<AuthLogin />} />
        <Route path="auth/logout" element={<AuthLogout />} />

        <Route element={<MainLayout />}>
          <Route path="" element={<Home />} />
          <Route path="editor" element={<Editor />} />
        </Route>
      </Route>
    </Routes>
  );
}
