// import { Menu } from 'lucide-react';
import { Outlet } from 'react-router';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

export default function MainLayout() {
  return (
    <>
      {/* <header className="flex flex-row justify-between border-b border-zinc-200 mb-3 p-3">
        <span className="font-mono font-bold">thatblog</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom">
            <DropdownMenuLabel className="font-bold">James</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:cursor-pointer">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header> */}
      <header className="flex flex-row justify-start border-b border-zinc-200 mb-3 p-3">
        <span className="font-mono font-bold">thatblog</span>
      </header>

      <Outlet />
    </>
  );
}
