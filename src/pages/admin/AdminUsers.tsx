import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRoles, useUpdateUserRole, useRemoveAdminRole } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AppRole } from '@/types/database';
import { Loader2, Shield, Users, AlertTriangle, Search, X } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  customer: 'Customer',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-primary/20 text-primary border-primary/30',
  customer: 'bg-muted text-muted-foreground border-muted',
};

const USERS_PER_PAGE = 10;

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const { data: userRoles, isLoading } = useUserRoles();
  const updateRole = useUpdateUserRole();
  const removeAdmin = useRemoveAdminRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!userRoles) return [];
    
    return userRoles.filter((userRole) => {
      const matchesSearch = 
        !searchQuery ||
        userRole.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userRole.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || userRole.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [userRoles, searchQuery, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: AppRole | 'all') => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleRoleChange = async (userId: string, role: AppRole) => {
    // Prevent removing own admin role
    if (userId === user?.id && role !== 'admin') {
      toast.error("You cannot remove your own admin role");
      return;
    }

    try {
      await updateRole.mutateAsync({ userId, role });
      toast.success(`Role updated to ${ROLE_LABELS[role]}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const adminCount = userRoles?.filter(r => r.role === 'admin').length || 0;
  const totalUsers = userRoles?.length || 0;
  const showingCount = filteredUsers.length;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Warning if only one admin */}
        {adminCount === 1 && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div>
                <CardTitle className="text-sm font-medium text-warning">Single Admin Warning</CardTitle>
                <CardDescription>
                  There's only one administrator. Consider adding another admin for backup access.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearchChange('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {searchQuery || roleFilter !== 'all' ? (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {showingCount} of {totalUsers} users
          </div>
        ) : null}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : paginatedUsers && paginatedUsers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.email || 'Unknown'}
                        {userRole.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {userRole.full_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[userRole.role]}>
                          {ROLE_LABELS[userRole.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={userRole.role}
                          onValueChange={(value: AppRole) => handleRoleChange(userRole.user_id, value)}
                          disabled={userRole.user_id === user?.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {paginatedUsers.map((userRole) => (
                <Card key={userRole.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground break-all">{userRole.email || 'Unknown'}</h3>
                          {userRole.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs shrink-0">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {userRole.full_name || '—'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Role</p>
                        <Badge className={ROLE_COLORS[userRole.role]}>
                          {ROLE_LABELS[userRole.role]}
                        </Badge>
                      </div>
                      <div className="flex-1 max-w-[160px] ml-4">
                        <p className="text-xs text-muted-foreground mb-1">Change Role</p>
                        <Select
                          value={userRole.role}
                          onValueChange={(value: AppRole) => handleRoleChange(userRole.user_id, value)}
                          disabled={userRole.user_id === user?.id}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              {searchQuery || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Users will appear here once they sign up.'}
            </p>
            {(searchQuery || roleFilter !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}