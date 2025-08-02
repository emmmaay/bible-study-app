import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Bell, Download, Palette, LogOut, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-xl text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-xl text-white">
              <Edit size={20} />
            </Button>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-semibold">{user?.name || "User"}</h1>
            <p className="text-primary-100">{user?.email}</p>
            <p className="text-primary-100 text-sm mt-2">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
            </p>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Progress Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-500">{user?.completedClasses || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-500">{user?.inProgressClasses || 0}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-500">{user?.totalBookmarks || 0}</p>
              <p className="text-sm text-gray-600">Bookmarks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{user?.totalNotes || 0}</p>
              <p className="text-sm text-gray-600">Notes</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <User className="text-success-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Account created</p>
                <p className="text-sm text-gray-500">Welcome to Bible Study Pro!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="text-gray-500" size={20} />
                <span className="font-medium text-gray-900">Notifications</span>
              </div>
              <Switch />
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="text-gray-500" size={20} />
                <span className="font-medium text-gray-900">Offline Content</span>
              </div>
              <Switch />
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="text-gray-500" size={20} />
                <span className="font-medium text-gray-900">Dark Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </div>

        {/* Admin Access */}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h2>
              <Link href="/admin">
                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                  Open Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
