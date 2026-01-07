import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRoles, useUpdateUserRole, useRemoveAdminRole } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AppRole } from '@/types/database';
import { Loader2, Shield, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  customer: 'Customer',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-primary/20 text-primary border-primary/30',
  customer: 'bg-muted text-muted-foreground border-muted',
};

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const { data: userRoles, isLoading } = useUserRoles();
  const updateRole = useUpdateUserRole();
  const removeAdmin = useRemoveAdminRole();

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

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
              <div className="text-2xl font-bold">{userRoles?.length || 0}</div>
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
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <CardTitle className="text-sm font-medium text-warning">Single Admin Warning</CardTitle>
                <CardDescription>
                  There's only one administrator. Consider adding another admin for backup access.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : userRoles && userRoles.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {userRole.full_name || 'No name set'}
                        </span>
                        {userRole.user_id === user?.id && (
                          <Badge variant="outline" className="w-fit mt-1 text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {userRole.email || 'Unknown'}
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
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No users yet
            </h2>
            <p className="text-muted-foreground">
              Users will appear here once they sign up.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}