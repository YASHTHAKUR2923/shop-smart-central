import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Laptop, 
  Monitor, 
  Network, 
  Server, 
  Cable, 
  Package, 
  ChevronDown,
  Settings,
  Phone,
  LogOut,
  LogIn,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORY_LABELS, BRAND_LABELS, ProductCategory, Brand } from '@/types/database';
import { cn } from '@/lib/utils';

const categoryIcons: Record<ProductCategory, React.ElementType> = {
  laptop: Laptop,
  desktop: Monitor,
  network_module: Network,
  server: Server,
  accessories: Cable,
  other: Package,
};

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    laptop: true,
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (category: ProductCategory) => 
    location.pathname.startsWith(`/products/${category}`);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="font-display font-bold text-sidebar-primary-foreground text-lg">PH</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-tight">
                Paras Hardwares
              </h1>
              <p className="text-xs text-sidebar-foreground/60">IT Solutions</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive('/') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Home className="w-5 h-5" />
                    {!collapsed && <span>Home</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/contact" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive('/contact') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Phone className="w-5 h-5" />
                    {!collapsed && <span>Contact Us</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            {!collapsed && 'Products'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((category) => {
                const Icon = categoryIcons[category];
                const isOpen = openCategories[category];
                
                return (
                  <SidebarMenuItem key={category}>
                    <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors",
                            isCategoryActive(category) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            {!collapsed && <span>{CATEGORY_LABELS[category]}</span>}
                          </div>
                          {!collapsed && (
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              isOpen && "rotate-180"
                            )} />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      
                      {!collapsed && (
                        <CollapsibleContent>
                          <div className="ml-8 mt-1 space-y-1">
                            {(Object.keys(BRAND_LABELS) as Brand[]).map((brand) => (
                              <Link
                                key={brand}
                                to={`/products/${category}/${brand}`}
                                className={cn(
                                  "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                  location.pathname === `/products/${category}/${brand}`
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )}
                              >
                                {BRAND_LABELS[brand]}
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              {!collapsed && 'Admin'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link 
                      to="/admin" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {!collapsed && <span>Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link 
                      to="/admin/products" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/products') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Package className="w-5 h-5" />
                      {!collapsed && <span>Manage Products</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link 
                      to="/admin/inquiries" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/inquiries') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Phone className="w-5 h-5" />
                      {!collapsed && <span>Inquiries</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user ? (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!collapsed && 'Sign Out'}
          </Button>
        ) : (
          <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Link to="/auth">
              <LogIn className="w-5 h-5 mr-3" />
              {!collapsed && 'Sign In'}
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
