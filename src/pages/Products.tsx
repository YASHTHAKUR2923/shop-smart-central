import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { ContactDialog } from '@/components/products/ContactDialog';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Product, 
  ProductCategory, 
  Brand, 
  CATEGORY_LABELS, 
  BRAND_LABELS 
} from '@/types/database';
import { ChevronRight, Package } from 'lucide-react';

export default function Products() {
  const { category, brand } = useParams<{ category: ProductCategory; brand: Brand }>();
  const { data: products, isLoading } = useProducts(category, brand);
  const [contactProduct, setContactProduct] = useState<Product | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const handleContactClick = (product: Product) => {
    setContactProduct(product);
    setContactDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Products</span>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>{CATEGORY_LABELS[category]}</span>
            </>
          )}
          {brand && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{BRAND_LABELS[brand]}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {brand ? BRAND_LABELS[brand] : 'All'} {category ? CATEGORY_LABELS[category] : 'Products'}
            </h1>
            {products && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                {products.length} products
              </Badge>
            )}
          </div>
          
          {/* Brand filter pills */}
          {category && (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BRAND_LABELS) as Brand[]).map((b) => (
                <Link
                  key={b}
                  to={`/products/${category}/${b}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    brand === b
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {BRAND_LABELS[b]}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onContactClick={handleContactClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No products found
            </h2>
            <p className="text-muted-foreground mb-6">
              We don't have any products in this category yet.
            </p>
            <Link
              to="/"
              className="text-primary hover:text-primary/80 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>

      <ContactDialog
        product={contactProduct}
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </MainLayout>
  );
}
