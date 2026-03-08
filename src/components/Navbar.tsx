import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, BookOpen, Clock, Library, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SearchModal from './SearchModal';

export default function Navbar() {
  const { isAuthenticated, user, logout, setShowLoginModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/latest', label: 'Latest', icon: Clock },
    { to: '/series', label: 'Series', icon: BookOpen },
    { to: '/library', label: 'Library', icon: Library },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-lg text-foreground">Kayn Scan</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button
                    variant={isActive(to) ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2 text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden md:flex gap-2"
                onClick={() => setShowLoginModal(true)}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-card animate-fade-up">
            <div className="container py-4 flex flex-col gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive(to) ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                </Link>
              ))}
              {isAuthenticated ? (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="default" className="w-full justify-start gap-2" onClick={() => { setShowLoginModal(true); setMobileOpen(false); }}>
                  <LogIn className="w-4 h-4" />
                  Sign In
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
