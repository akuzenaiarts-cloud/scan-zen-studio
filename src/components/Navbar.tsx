import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LayoutGrid, BarChart3, LogIn, LogOut, User, ClipboardList, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SearchModal from './SearchModal';

export default function Navbar() {
  const { isAuthenticated, user, logout, setShowLoginModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const isSubPage = location.pathname.startsWith('/manga/');

  // Extract slug from path for chapter pages
  const pathParts = location.pathname.split('/');
  const isChapterPage = pathParts.length >= 5 && pathParts[3] === 'chapter';
  const mangaSlug = pathParts[2] || '';

  const handleBack = () => {
    if (isChapterPage) {
      navigate(`/manga/${mangaSlug}`);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="z-50 bg-transparent">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 flex h-16 items-center justify-between">
          {/* Logo */}
          {isSubPage ? (
            <button onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
              <span className="font-semibold text-lg text-foreground tracking-tight">Kayn Scan</span>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden">
                <span className="text-foreground font-bold text-base">K</span>
              </div>
              <span className="font-semibold text-lg text-foreground tracking-tight">Kayn Scan</span>
            </Link>
          )}

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2.5">
            <Button
              variant="ghost"
              className="rounded-full gap-2.5 px-5 h-11 bg-white/10 hover:bg-white/20 backdrop-blur text-base font-medium"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              Search
            </Button>

            <Link to="/latest">
              <Button
                variant="ghost"
                className={`rounded-full px-4 h-11 bg-white/10 hover:bg-white/20 backdrop-blur ${isActive('/latest') ? 'bg-white/20' : ''}`}
              >
                <ClipboardList className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/series">
              <Button
                variant="ghost"
                className={`rounded-full gap-2.5 px-5 h-11 bg-white/10 hover:bg-white/20 backdrop-blur text-base font-medium ${isActive('/series') ? 'bg-white/20' : ''}`}
              >
                <LayoutGrid className="w-5 h-5" />
                Series
              </Button>
            </Link>

            <Link to="/library">
              <Button
                variant="ghost"
                className={`rounded-full gap-2.5 px-5 h-11 bg-white/10 hover:bg-white/20 backdrop-blur text-base font-medium ${isActive('/library') ? 'bg-white/20' : ''}`}
              >
                <BarChart3 className="w-5 h-5" />
                Library
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 ml-1">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-base font-medium">{user?.name}</span>
                </div>
                <Button variant="ghost" className="rounded-full h-11 px-4 bg-white/10 hover:bg-white/20 backdrop-blur" onClick={logout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="rounded-full gap-2.5 px-5 h-11 bg-white/10 hover:bg-white/20 backdrop-blur text-base font-medium ml-1"
                onClick={() => setShowLoginModal(true)}
              >
                <LogIn className="w-5 h-5" />
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/80 backdrop-blur animate-fade-up">
            <div className="px-6 sm:px-10 lg:px-16 xl:px-24 py-4 flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-start gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur" onClick={() => { setSearchOpen(true); setMobileOpen(false); }}>
                <Search className="w-4 h-4" /> Search
              </Button>
              <Link to="/latest" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start gap-2 rounded-full ${isActive('/latest') ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} backdrop-blur`}>
                  <ClipboardList className="w-4 h-4" /> Latest
                </Button>
              </Link>
              <Link to="/series" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start gap-2 rounded-full ${isActive('/series') ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} backdrop-blur`}>
                  <LayoutGrid className="w-4 h-4" /> Series
                </Button>
              </Link>
              <Link to="/library" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start gap-2 rounded-full ${isActive('/library') ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} backdrop-blur`}>
                  <BarChart3 className="w-4 h-4" /> Library
                </Button>
              </Link>
              {isAuthenticated ? (
                <Button variant="ghost" className="w-full justify-start gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              ) : (
                <Button variant="ghost" className="w-full justify-start gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur" onClick={() => { setShowLoginModal(true); setMobileOpen(false); }}>
                  <LogIn className="w-4 h-4" /> Sign in
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}