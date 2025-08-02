import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { LogOut, Users, TrendingUp, School, Plus, Edit, Upload, Eye, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {user?.role === "super_admin" ? "Super Administrator" : "Administrator"}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <LogOut className="text-gray-600" size={20} />
              </Button>
            </div>
          </div>
        </header>

        {/* Admin Stats */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Users className="text-primary-600" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                  <p className="text-sm text-gray-600">Active This Week</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-success-600" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedClasses || 0}</p>
                  <p className="text-sm text-gray-600">Classes Completed</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <School className="text-secondary-600" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageProgress || 0}%</p>
                  <p className="text-sm text-gray-600">Avg. Progress</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link href="/admin/classes/new">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Plus className="text-primary-600" size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add New Class</p>
                        <p className="text-sm text-gray-500">Create and publish a new lesson</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/admin/classes">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                        <Edit className="text-secondary-600" size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Manage Existing Classes</p>
                        <p className="text-sm text-gray-500">Edit or update published content</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                      <Upload className="text-success-600" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Bulk Content Import</p>
                      <p className="text-sm text-gray-500">Import multiple classes at once</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* User Management (Super Admin Only) */}
            {user?.role === "super_admin" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                </div>
                <div className="p-6 space-y-4">
                  <Link href="/admin/users">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Eye className="text-purple-600" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">View All Users</p>
                          <p className="text-sm text-gray-500">User progress and activity</p>
                        </div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/admin/admins">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <Settings className="text-red-600" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Manage Administrators</p>
                          <p className="text-sm text-gray-500">Add or remove admin access</p>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-around">
            <Link href="/admin">
              <button className="flex flex-col items-center py-2 px-3 text-primary-500">
                <TrendingUp size={20} className="mb-1" />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
            </Link>
            <Link href="/admin/classes">
              <button className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-gray-600">
                <School size={20} className="mb-1" />
                <span className="text-xs">Content</span>
              </button>
            </Link>
            {user?.role === "super_admin" && (
              <Link href="/admin/users">
                <button className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-gray-600">
                  <Users size={20} className="mb-1" />
                  <span className="text-xs">Users</span>
                </button>
              </Link>
            )}
            <Link href="/admin/settings">
              <button className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-gray-600">
                <Settings size={20} className="mb-1" />
                <span className="text-xs">Settings</span>
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
