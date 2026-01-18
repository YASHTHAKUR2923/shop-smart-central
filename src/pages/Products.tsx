import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { ContactDialog } from '@/components/products/ContactDialog';
import { useProductsByCustomCategory } from '@/hooks/useProducts';
import { useCategories, useSubcategories, useBrands } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/database';
import { ChevronRight, Package, Filter } from 'lucide-react';

export default function Products() {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams<{ category?: string; subcategory?: string }>();

  // Fetch categories and subcategories from database
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategories();
  const { data: brands } = useBrands();

  // Find the current category and subcategory objects
  const currentCategory = categories?.find(c => c.slug === categorySlug);
  const currentSubcategory = subcategories?.find(s => s.slug === subcategorySlug && s.category_id === currentCategory?.id);

  // Get subcategories for current category
  const categorySubcategories = subcategories?.filter(s => s.category_id === currentCategory?.id) || [];

  // Fetch products filtered by custom category and subcategory IDs
  const { data: products, isLoading } = useProductsByCustomCategory(
    currentCategory?.id,
    currentSubcategory?.id
  );

  const [contactProduct, setContactProduct] = useState<Product | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleContactClick = (product: Product) => {
    setContactProduct(product);
    setContactDialogOpen(true);
  };

  // Filter by brand if selected
  const displayProducts = selectedBrand
    ? products?.filter(p => p.brand === selectedBrand)
    : products;

  // Build page title
  const pageTitle = currentSubcategory
    ? currentSubcategory.name
    : currentCategory
      ? currentCategory.name
      : 'All Products';

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Products</span>
          {currentCategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                to={`/products/${currentCategory.slug}`}
                className={!currentSubcategory ? "text-foreground font-medium" : "hover:text-foreground transition-colors"}
              >
                {currentCategory.name}
              </Link>
            </>
          )}
          {currentSubcategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{currentSubcategory.name}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {pageTitle}
            </h1>
            {displayProducts && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                {displayProducts.length} products
              </Badge>
            )}
          </div>

          {/* Subcategory pills - Show if category has subcategories and we're viewing a category */}
          {currentCategory && categorySubcategories.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Subcategories:</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/products/${currentCategory.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!currentSubcategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                >
                  All
                </Link>
                {categorySubcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/products/${currentCategory.slug}/${sub.slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentSubcategory?.id === sub.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Brand filter pills */}
          {brands && brands.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Filter by brand:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedBrand
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedBrand === brand.slug
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
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
        ) : displayProducts && displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
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
