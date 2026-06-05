import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import {
  LayoutDashboard,
  MessageSquare,
  CalendarClock,
  Users,
  Megaphone,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bot,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  
  // Robust check based on User schema: roles can be 'admin', 'user', or 'superadmin'
  const role = user?.role || 'user'
  const isAdmin = role === 'admin' || role === 'superadmin'

  const allNavItems = [
    { 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      text: 'Dashboard', 
      roles: ['admin', 'user', 'superadmin'] 
    },
    { 
      to: '/scheduledmessage', 
      icon: CalendarClock, 
      text: 'My Invitations', 
      roles: ['admin', 'user', 'superadmin'] 
    },
    { 
      to: '/whatsapp-session', 
      icon: QrCode, 
      text: 'WhatsApp Setup', 
      roles: ['admin', 'user', 'superadmin'] 
    },
    { 
      to: '/settings', 
      icon: Settings, 
      text: 'Settings', 
      roles: ['admin', 'user', 'superadmin'] 
    }
  ]

  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-300 h-screen transition-all duration-300 border-r border-slate-800 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-bold text-white tracking-tight text-lg">Invitely</span>}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.to} open={isCollapsed ? undefined : false}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isCollapsed ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  {!isCollapsed && <span className="truncate">{item.text}</span>}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{item.text}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-9 w-9 ring-2 ring-slate-800">
            <AvatarImage />
            <AvatarFallback className="bg-slate-700 text-slate-200 text-xs font-bold uppercase">
              {user?.name?.[0] || user?.username?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@invitely.com'}</p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 px-3"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white shadow-xl z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}