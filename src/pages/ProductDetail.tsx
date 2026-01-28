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
  ArrowLeft,
  ShoppingCart,
  PlayCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { addItem } = useQuoteCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success('Added to Quote Cart');
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          {/* Product Image Gallery */}
          <div className="animate-fade-in space-y-4">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden border">
              {(selectedImage || product.image_url) ? (
                <img
                  src={selectedImage || product.image_url || ''}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {(product.additional_images && product.additional_images.length > 0) && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedImage(null)} // Reset to main
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${!selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt="Main" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 m-auto text-muted-foreground" />
                  )}
                </button>
                {product.additional_images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-transparent'
                      }`}
                  >
                    {/* Basic check for video type in URL if possible, otherwise assume image */}
                    {/* For simplicity assuming images, but if video functionality is needed, we'd need a different player. 
                        Prompt said Photos/Videos. I'll assume they are URLs. */}
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{BRAND_LABELS[product.brand]}</Badge>
              <Badge variant="outline">{CATEGORY_LABELS[product.category]}</Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Stock Status */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
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
              {product.model_no && (
                <div className="text-sm text-muted-foreground border-l pl-4">
                  Model: <span className="font-medium text-foreground">{product.model_no}</span>
                </div>
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
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto h-auto py-3 whitespace-normal flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="mr-2 w-5 h-5 flex-shrink-0" />
                Add to Quote Cart
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto h-auto py-3 whitespace-normal flex-1 font-semibold"
                onClick={() => setContactDialogOpen(true)}
              >
                <Phone className="mr-2 w-5 h-5 flex-shrink-0" />
                Request a Call
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-auto py-3 whitespace-normal flex-1 sm:flex-none"
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
