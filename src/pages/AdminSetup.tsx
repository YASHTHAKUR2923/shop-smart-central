import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAdminExists } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSetup() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: adminExists, isLoading: checkingAdmin } = useAdminExists();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Redirect if admin already exists
    if (!checkingAdmin && adminExists === true) {
      navigate('/');
    }
  }, [adminExists, checkingAdmin, navigate]);

  const handleInitializeAdmin = async () => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }

    setIsInitializing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('initialize-admin', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        setInitialized(true);
        toast.success('You are now the administrator!');
        
        // Refresh the page to update auth context
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      } else {
        throw new Error(response.data?.error || 'Failed to initialize admin');
      }
    } catch (error: any) {
      console.error('Error initializing admin:', error);
      toast.error(error.message || 'Failed to initialize admin');
    } finally {
      setIsInitializing(false);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If admin already exists, show message
  if (adminExists === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Admin Already Exists</CardTitle>
            <CardDescription>
              An administrator has already been set up for this system. Please contact the existing admin for access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle>Admin Initialized!</CardTitle>
            <CardDescription>
              You have been set as the administrator. Redirecting to the admin dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">First-Time Setup</CardTitle>
          <CardDescription>
            No administrator has been set up yet. Set yourself as the first admin to manage this system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Please sign in or create an account first to become the administrator.
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In / Create Account
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Signed in as: <strong>{user.email}</strong>
                </p>
              </div>
              <Button 
                onClick={handleInitializeAdmin} 
                className="w-full bg-primary"
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Initialize as Admin
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}