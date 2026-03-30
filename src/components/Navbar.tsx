import { Link, useNavigate } from 'react-router-dom';
import { auth, signOut, FirebaseUser } from '../firebase';
import { LogOut, LayoutDashboard, Settings, User as UserIcon, BookOpen } from 'lucide-react';

interface Props {
  user: FirebaseUser | null;
  role: string | null;
}

export default function Navbar({ user, role }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>EduConnect</span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">{user.displayName}</span>
                <span className="text-xs text-gray-500 capitalize">{role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
