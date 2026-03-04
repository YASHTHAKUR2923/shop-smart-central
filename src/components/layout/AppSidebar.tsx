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
import { useCategories, useSubcategories, CustomCategory, CustomSubcategory } from '@/hooks/useCategories';
import { useServiceCategories, useServiceSubcategories } from '@/hooks/useServiceCategories';
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
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories();

  const { data: serviceCategories, isLoading: serviceCategoriesLoading } = useServiceCategories();
  const { data: serviceSubcategories, isLoading: serviceSubcategoriesLoading } = useServiceSubcategories();

  // Group subcategories by category_id for easy lookup
  const subcategoriesByCategory = (subcategories || []).reduce((acc, sub) => {
    if (!acc[sub.category_id]) acc[sub.category_id] = [];
    acc[sub.category_id].push(sub);
    return acc;
  }, {} as Record<string, CustomSubcategory[]>);

  const serviceSubcategoriesByCategory = (serviceSubcategories || []).reduce((acc, sub) => {
    if (!acc[sub.category_id]) acc[sub.category_id] = [];
    acc[sub.category_id].push(sub);
    return acc;
  }, {} as Record<string, any[]>);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (slug: string) =>
    location.pathname.startsWith(`/products/${slug}`);
  const isServiceCategoryActive = (slug: string) =>
    location.pathname.startsWith(`/services/${slug}`);

  const isLoading = categoriesLoading || subcategoriesLoading;

  return (
    <Sidebar className="border-r border-sidebar-border">
   <SidebarHeader className="border-b border-sidebar-border">
  <Link to="/" className="flex items-center justify-center">
    <img
      src="/logo22.png"
      alt="Paras Enterprises"
      className="h-auto w-56 object-contain"
    />
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
              <SidebarMenu className="space-y-1">
                {categories?.map((category) => {
                  const Icon = iconMap[category.icon || 'Package'] || Package;
                  const isOpen = openCategories[category.slug];
                  const categorySubs = subcategoriesByCategory[category.id] || [];
                  const hasSubcategories = categorySubs.length > 0;

                  // If no subcategories, render as direct link
                  if (!hasSubcategories) {
                    return (
                      <SidebarMenuItem key={category.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={`/products/${category.slug}`}
                            className={cn(
                              "group/item flex items-center gap-3 px-3 py-2 rounded-lg transition-colors h-auto min-h-8",
                              isCategoryActive(category.slug) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="truncate group-hover/item:whitespace-normal">{category.name}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // If has subcategories, render as collapsible
                  return (
                    <SidebarMenuItem key={category.id}>
                      <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.slug)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "group/trigger flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors h-auto min-h-8",
                              isCategoryActive(category.slug) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              {!collapsed && <span className="truncate group-hover/trigger:whitespace-normal text-left">{category.name}</span>}
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
                              {categorySubs.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  to={`/products/${category.slug}/${subcategory.slug}`}
                                  className={cn(
                                    "group/sub block px-3 py-1.5 text-sm rounded-md transition-colors h-auto",
                                    location.pathname === `/products/${category.slug}/${subcategory.slug}`
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                  )}
                                >
                                  <span className="truncate group-hover/sub:whitespace-normal block">{subcategory.name}</span>
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
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            {!collapsed && 'Services'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {serviceCategoriesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-sidebar-foreground/50" />
              </div>
            ) : (
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/services"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/services') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Package className="w-5 h-5" />
                      {!collapsed && <span>All Services</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {serviceCategories?.map((category) => {
                  const Icon = iconMap[category.icon || 'Package'] || Package;
                  const isOpen = openCategories[`service-${category.slug}`];
                  const categorySubs = serviceSubcategoriesByCategory[category.id] || [];
                  const hasSubcategories = false; // Disable subcategories in sidebar for services for now to keep it simple, or enablement logic needs to be fixed.
                  // Actually, let's enable it if we want. But the user asked for services showing to customers also.
                  // Let's replicate the logic.

                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={`/services/${category.slug}`}
                          className={cn(
                            "group/item flex items-center gap-3 px-3 py-2 rounded-lg transition-colors h-auto min-h-8",
                            isServiceCategoryActive(category.slug) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                          )}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span className="truncate group-hover/item:whitespace-normal">{category.name}</span>}
                        </Link>
                      </SidebarMenuButton>
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
                      to="/admin/services"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/services') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Server className="w-5 h-5" />
                      {!collapsed && <span>Services</span>}
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
                      {!collapsed && <span>Prod. Categories</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/admin/service-categories"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive('/admin/service-categories') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <FolderTree className="w-5 h-5" />
                      {!collapsed && <span>Serv. Categories</span>}
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
    </Sidebar >
  );
}