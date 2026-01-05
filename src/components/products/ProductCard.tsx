import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Eye, Package } from 'lucide-react';
import { Product, BRAND_LABELS, CATEGORY_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onContactClick?: (product: Product) => void;
}

export function ProductCard({ product, onContactClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-fade-in">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {BRAND_LABELS[product.brand]}
          </Badge>
        </div>
        
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="font-display font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {product.show_price && product.price ? (
          <p className="font-display text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Contact for pricing
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          asChild 
          variant="outline" 
          className="flex-1"
        >
          <Link to={`/product/${product.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </Button>
        
        <Button 
          onClick={() => onContactClick?.(product)}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={!product.in_stock}
        >
          <Phone className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
