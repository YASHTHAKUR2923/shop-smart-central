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
  Phone,
  LogOut,
  LogIn,
  LayoutDashboard,
  FolderTree,
  Users,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBrands } from '@/hooks/useCategories';
import { useAllCategoryBrands } from '@/hooks/useCategoryBrands';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic categories
const iconMap: Record<string, React.ElementType> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Network: Network,
  Server: Server,
  Cable: Cable,
  Package: Package,
};

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categoryBrands, isLoading: categoryBrandsLoading } = useAllCategoryBrands();
  
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Get brands for a specific category
  const getBrandsForCategory = (categoryId: string) => {
    if (!categoryBrands || !brands) return [];
    const brandIds = categoryBrands
      .filter(cb => cb.category_id === categoryId)
      .map(cb => cb.brand_id);
    return brands.filter(b => brandIds.includes(b.id));
  };

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (slug: string) => 
    location.pathname.startsWith(`/products/${slug}`);

  const isLoading = categoriesLoading || brandsLoading || categoryBrandsLoading;

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
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-sidebar-foreground/50" />
              </div>
            ) : (
              <SidebarMenu>
                {categories?.map((category) => {
                  const Icon = iconMap[category.icon || 'Package'] || Package;
                  const isOpen = openCategories[category.slug];
                  
                  return (
                    <SidebarMenuItem key={category.id}>
                      <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.slug)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors",
                              isCategoryActive(category.slug) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              {!collapsed && <span>{category.name}</span>}
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
                              {getBrandsForCategory(category.id).map((brand) => (
                                <Link
                                  key={brand.id}
                                  to={`/products/${category.slug}/${brand.slug}`}
                                  className={cn(
                                    "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                    location.pathname === `/products/${category.slug}/${brand.slug}`
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                  )}
                                >
                                  {brand.name}
                                </Link>
                              ))}
                              {getBrandsForCategory(category.id).length === 0 && (
                                <span className="block px-3 py-1.5 text-sm text-sidebar-foreground/50">
                                  No brands
                                </span>
                              )}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
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
                      {!collapsed && <span>Products</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link 
                      to="/admin/categories" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/categories') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <FolderTree className="w-5 h-5" />
                      {!collapsed && <span>Categories</span>}
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link 
                      to="/admin/users" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/users') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Users className="w-5 h-5" />
                      {!collapsed && <span>Users</span>}
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