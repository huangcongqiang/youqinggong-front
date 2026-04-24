import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, Navigate, Link } from "react-router";
import { useStore } from "./store";
import { 
  LayoutDashboard, FileText, Briefcase, MessageSquare, 
  CheckCircle, FileSearch, Wallet, Bell, Search, LogOut, FileCheck,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "./utils/cn";
import { motion, AnimatePresence } from "motion/react";

const getMenu = (role: 'ENTERPRISE' | 'TALENT') => {
  if (role === 'ENTERPRISE') {
    return [
      { path: "/enterprise", label: "工作台", icon: LayoutDashboard },
      { path: "/enterprise/publish", label: "发布任务", icon: FileText },
      { path: "/enterprise/talents", label: "寻找人才", icon: Search },
      { path: "/enterprise/workspace", label: "合同协作", icon: Briefcase },
      { path: "/enterprise/chat", label: "合同消息", icon: MessageSquare },
      { path: "/enterprise/acceptance", label: "验收", icon: CheckCircle },
      { path: "/enterprise/approvals", label: "审批中心", icon: FileCheck },
      { path: "/enterprise/records", label: "交易记录", icon: FileSearch },
      { path: "/enterprise/settlement", label: "结算中心", icon: Wallet },
      { path: "/enterprise/billing", label: "账单管理", icon: FileText },
    ];
  }
  return [
    { path: "/talent", label: "工作台", icon: LayoutDashboard },
    { path: "/talent/tasks", label: "任务广场", icon: Search },
    { path: "/talent/workspace", label: "我的协作", icon: Briefcase },
    { path: "/talent/chat", label: "消息", icon: MessageSquare },
    { path: "/talent/acceptance", label: "交付与验收", icon: CheckCircle },
    { path: "/talent/records", label: "收入记录", icon: FileSearch },
    { path: "/talent/settlement", label: "我的结算", icon: Wallet },
  ];
};

export function AuthLayout() {
  const { currentUser, logout, isBootstrapping } = useStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        正在恢复登录态...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const menu = getMenu(currentUser.role === 'BOTH' ? 'ENTERPRISE' : currentUser.role);
  const currentAudience = currentUser.role === 'TALENT' ? 'talent' : 'enterprise';

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={cn(
        "bg-white border-r border-slate-200 hidden lg:flex flex-col z-20 shrink-0 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 shadow-sm z-30 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={cn("h-16 flex items-center border-b border-slate-100 shrink-0 transition-all overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6")}>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 whitespace-nowrap">
            {isCollapsed ? "轻" : "有轻功"}
          </div>
        </div>
        
        {/* Search Bar in Sidebar */}
        <div className="px-4 py-4 shrink-0 min-h-[64px] flex items-center justify-center">
          {isCollapsed ? (
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="搜索">
              <Search className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索任务、人才、合同..." 
                className="w-full bg-slate-100/50 border border-slate-200/50 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 overflow-x-hidden">
          <div className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-all truncate", isCollapsed ? "text-center px-0" : "px-3")}>
            {isCollapsed ? "导航" : "功能导航"}
          </div>
          <nav className="space-y-1">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/enterprise" || item.path === "/talent"}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) => cn(
                  "flex items-center py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  isCollapsed ? "justify-center px-0" : "px-3 space-x-3",
                  isActive 
                    ? "text-indigo-700 bg-indigo-50/80" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className={cn("absolute bg-indigo-600 rounded-r-full", isCollapsed ? "left-0 top-1/4 bottom-1/4 w-1" : "left-0 top-1.5 bottom-1.5 w-1")}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (User Info & Actions) */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <button 
                onClick={() => { logout().finally(() => navigate('/auth')); }} 
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col space-y-3 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.role === 'ENTERPRISE' ? '企业版' : '人才版'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Link
                  to={`/${currentAudience}/notifications`}
                  className="text-slate-500 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50"
                  title="通知"
                >
                  <Bell className="w-4 h-4" />
                </Link>
                <Link
                  to={`/${currentAudience}/assistant`}
                  className="text-indigo-600 bg-indigo-100/50 hover:bg-indigo-100 transition-colors px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1"
                >
                  <span>🌟</span>
                  <span>AI 助手</span>
                </Link>
                <button 
                  onClick={() => { logout().finally(() => navigate('/auth')); }} 
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-lg"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
          <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            有轻功
          </div>
          <div className="flex items-center space-x-4">
            <Link to={`/${currentAudience}/notifications`} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 min-h-full">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </div>
        
        {/* Mobile Navigation Bar (Bottom) */}
        <div className="lg:hidden bg-white border-t border-slate-200 z-30 pb-safe shrink-0 sticky bottom-0">
          <nav className="flex items-center justify-around h-16 px-2">
            {menu.slice(0, 5).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/enterprise" || item.path === "/talent"}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 text-xs transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                    <span className="scale-90">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
