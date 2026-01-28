import { useState } from 'react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Phone, Search, User, ShoppingCart } from 'lucide-react';
import { useQuoteCart } from '@/contexts/QuoteCartContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useQuoteCart();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />

            {/* Logo/Brand - visible when sidebar is collapsed */}
            <Link to="/" className="flex items-center gap-2 mr-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">PE</span>
              </div>
              <span className="font-display font-semibold text-foreground hidden sm:block">
                Paras Enterprises
              </span>
            </Link>

            <div className="flex-1" />

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative mr-1"
                aria-label="Quote Cart"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/contact">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Link>
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin">Admin</Link>
                    </Button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ) : (
                <Button variant="default" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>

        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      </div>
    </SidebarProvider>
  );
}