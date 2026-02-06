import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useInquiries } from '@/hooks/useInquiries';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  Package,
  Phone,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: products } = useProducts();
  const { data: inquiries } = useInquiries();

  if (authLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingInquiries = inquiries?.filter(i => i.status === 'pending').length || 0;
  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter(p => p.in_stock).length || 0;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      description: `${inStockProducts} in stock`,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Inquiries',
      value: pendingInquiries,
      description: 'Awaiting response',
      icon: Phone,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Inquiries',
      value: inquiries?.length || 0,
      description: 'All time',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your store and customer inquiries
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map(({ title, value, description, icon: Icon, color, bgColor }) => (
            <Card key={title} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-display font-bold text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/products">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CardTitle className="font-display flex items-center justify-between">
                  Manage Products
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Add, edit, or remove products from your catalog
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/inquiries">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CardTitle className="font-display flex items-center justify-between">
                  View Inquiries
                  {pendingInquiries > 0 && (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      <span className="text-sm font-normal text-accent">{pendingInquiries} pending</span>
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Manage customer inquiries and send quotations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Link to="/admin/categories">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CardTitle className="font-display flex items-center justify-between">
                  Product Categories
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Manage product categories, subcategories & brands
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/service-categories">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CardTitle className="font-display flex items-center justify-between">
                  Service Categories
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Manage service categories & subcategories
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
