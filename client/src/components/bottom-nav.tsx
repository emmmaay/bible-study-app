import { Link, useLocation } from "wouter";
import { Home, Bookmark, FileText, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { path: "/notes", icon: FileText, label: "Notes" },
    { path: "/profile", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? "text-primary-500" : "text-gray-400 hover:text-gray-600"
              }`}>
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
