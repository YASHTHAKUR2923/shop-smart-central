import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContactDialog } from '@/components/products/ContactDialog';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CATEGORY_LABELS, 
  BRAND_LABELS 
} from '@/types/database';
import { 
  ChevronRight, 
  Phone, 
  Package, 
  CheckCircle2, 
  XCircle,
  ArrowLeft
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/products/${product.category}/${product.brand}`}
            className="hover:text-foreground transition-colors"
          >
            {CATEGORY_LABELS[product.category]}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{BRAND_LABELS[product.brand]}</Badge>
              <Badge variant="outline">{CATEGORY_LABELS[product.category]}</Badge>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-success font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Price */}
            {product.show_price && product.price ? (
              <p className="font-display text-4xl font-bold text-primary mb-6">
                {formatPrice(product.price)}
              </p>
            ) : (
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-muted-foreground">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Contact us for the best pricing
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="font-display font-semibold text-foreground mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-4">
                  <h2 className="font-display font-semibold text-foreground mb-4">Specifications</h2>
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm text-muted-foreground">{key}</dt>
                        <dd className="font-medium text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={() => setContactDialogOpen(true)}
                disabled={!product.in_stock}
              >
                <Phone className="mr-2 w-5 h-5" />
                Request a Call
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="outline"
              >
                <Link to={`/products/${product.category}/${product.brand}`}>
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ContactDialog
        product={product}
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </MainLayout>
  );
}
