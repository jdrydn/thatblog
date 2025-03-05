import { Menu } from 'lucide-react';
import { Outlet } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MainLayout() {
  return (
    <>
      <header className="flex flex-row justify-between border-b border-zinc-200 mb-3 p-3">
        <span className="font-bold">thatblog</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom">
            <DropdownMenuLabel className="font-bold">James</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Outlet />
    </>
  );
}
