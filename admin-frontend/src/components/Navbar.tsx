import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import {
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="relative z-50 pt-6">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16  rounded-2xl px-6">
          {/* Logo */}
          <div className="flex items-center cursor-pointer gap-1" onClick={() => navigate('/')}>
            <span className="text-4xl font-bold tracking-tight text-slate-900">Invitely</span>

            <div className="h-5 w-5 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm -mt-3 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white">
                <path d="M16 .5C7.5.5.5 7.5.5 16c0 2.8.7 5.4 2 7.7L.5 31.5l7.9-2c2.2 1.2 4.7 1.9 7.6 1.9 8.5 0 15.5-7 15.5-15.5S24.5.5 16 .5zm0 28.3c-2.5 0-4.9-.7-7-1.9l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-7.1 0-7.3 6-13.3 13.3-13.3S29.3 8.7 29.3 16 23.3 28.8 16 28.8zm7.3-9.7c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-.4-.4-.8-.9-1.2-1.5-.1-.2 0-.4.1-.6.1-.1.3-.4.5-.6.2-.2.3-.4.4-.6.1-.2 0-.5 0-.6 0-.1-.9-2.1-1.2-2.8-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 3 0 1.8 1.3 3.5 1.5 3.8.2.3 2.6 4 6.4 5.4.9.3 1.6.5 2.2.6.9.1 1.7.1 2.3.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z" />
              </svg>
            </div>
          </div>

          {/* Nav Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-8">
              <span onClick={() => navigate('/features')} className="cursor-pointer text-sm font-bold text-slate-600 hover:text-[#3fc07c] transition-colors">Features</span>
              <span onClick={() => navigate('/pricing')} className="cursor-pointer text-sm font-bold text-slate-600 hover:text-[#3fc07c] transition-colors">Pricing</span>
              <span onClick={() => navigate('/contact')} className="cursor-pointer text-sm font-bold text-slate-600 hover:text-[#3fc07c] transition-colors">Contact</span>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-full transition-colors">
                      <Avatar className="h-8 w-8 border border-slate-200">
                        <AvatarImage src="https://th.bing.com/th/id/OIP.S171c9HYsokHyCPs9brbPwHaGP?rs=1&pid=ImgDetMain" />
                        <AvatarFallback className="bg-[#3fc07c] text-white text-xs font-black">
                          {user?.name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100">
                    <DropdownMenuLabel className="font-bold px-3 py-2">
                      <p className="text-sm">{user?.name || 'Admin User'}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{user?.adminPhone || user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-lg gap-2 cursor-pointer py-2 px-3 font-medium">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg gap-2 cursor-pointer py-2 px-3 font-medium">
                      <UserIcon className="h-4 w-4" /> Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg gap-2 cursor-pointer py-2 px-3 font-medium text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
