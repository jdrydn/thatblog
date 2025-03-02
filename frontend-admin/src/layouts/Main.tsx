import { Outlet } from 'react-router';

export default function MainLayout() {
  return (
    <>
      <header className="flex flex-row justify-between border-b border-zinc-200 mb-3 p-3">
        <span className="logo">thatblog</span>
        <span className="logo">menu</span>
      </header>

      <Outlet />
    </>
  );
}
