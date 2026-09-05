import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ExternalLink, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedLogo } from '../AnimatedLogo';
import { useAuthStore } from '@/store/authStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { AuthModal } from '../AuthModal';

interface AnimatedLogoProps {
  className?: string;
}

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuthStore();
  const { watchlist } = useWatchlistStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderAuthButton = () => {
    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-4">
          {/* FAVORITE COUNT */}
          <Link to="/marketplace" className="relative flex items-center gap-1 text-sm text-neutral-600 hover:text-blue-600">
            <Heart size={18} className={watchlist.length > 0? "fill-red-500 text-red-500" : ""} />
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {watchlist.length}
            </span>
          </Link>
          <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-blue-600">Dashboard</Link>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-2">
            <LogOut size={16} />{isLoggingOut? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <Link to="/marketplace" className="relative flex items-center gap-1 text-sm">
          <Heart size={18} className={watchlist.length > 0? "fill-red-500 text-red-500" : "text-neutral-600"} />
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{watchlist.length}</span>
        </Link>
        <Button onClick={handleOpenAuthModal}>Sign In</Button>
      </div>
    );
  };

  const navItems = [
    { name: 'Marketplace', path: '/marketplace', isExternal: false },
    { name: 'Join Waitlist', path: 'https://form.typeform.com/to/vcGRVShj', isExternal: true },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${isScrolled? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center"><AnimatedLogo className="w-32" /></Link>
          </div>
          <nav className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex items-center gap-8">
              {navItems.map((item) => item.isExternal? (
                <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-blue-600 flex items-center gap-1">{item.name}<ExternalLink size={14} /></a>
              ) : (
                <Link key={item.path} to={item.path} className={`text-sm ${location.pathname === item.path? 'text-blue-600 font-medium' : 'text-neutral-600 hover:text-blue-600'}`}>{item.name}</Link>
              ))}
            </div>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">{renderAuthButton()}</div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-neutral-600 hover:text-blue-600">
              {isMobileMenuOpen? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t">
            <div className="container-custom py-4">
              <nav className="flex flex-col gap-4 text-center">
                <div className="flex justify-center items-center gap-2 text-sm"><Heart size={16} className="text-red-500" /> Favorites: {watchlist.length}</div>
                {navItems.map((item) => item.isExternal? (
                  <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-blue-600 flex items-center gap-1 justify-center">{item.name}<ExternalLink size={14} /></a>
                ) : (
                  <Link key={item.path} to={item.path} className={`text-sm ${location.pathname === item.path? 'text-blue-600 font-medium' : 'text-neutral-600 hover:text-blue-600'}`}>{item.name}</Link>
                ))}
                <div className="pt-4 border-t">{renderAuthButton()}</div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </header>
  );
};