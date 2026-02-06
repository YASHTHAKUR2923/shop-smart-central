import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ContactDialog } from '@/components/products/ContactDialog'; // Reuse existing contact dialog
import { useServicesByCategory, Service } from '@/hooks/useServices';
import { useServiceCategories, useServiceSubcategories } from '@/hooks/useServiceCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Filter } from 'lucide-react';

export default function Services() {
    const { category: categorySlug, subcategory: subcategorySlug } = useParams<{ category?: string; subcategory?: string }>();

    // Fetch categories and subcategories
    const { data: categories } = useServiceCategories();
    const { data: subcategories } = useServiceSubcategories();

    // Find the current category and subcategory objects
    const currentCategory = categories?.find(c => c.slug === categorySlug);
    const currentSubcategory = subcategories?.find(s => s.slug === subcategorySlug && s.category_id === currentCategory?.id);

    // Get subcategories for current category
    const categorySubcategories = subcategories?.filter(s => s.category_id === currentCategory?.id) || [];

    // Fetch services filtered by category and subcategory IDs
    const { data: services, isLoading } = useServicesByCategory(
        currentCategory?.id,
        currentSubcategory?.id
    );

    const [contactService, setContactService] = useState<Service | null>(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    const handleContactClick = (service: Service) => {
        // Adapter for Service to Product type if necessary, or check if ContactDialog implies Product type
        // Since ContactDialog expects Product, we might need to cast or adapt.
        // Ideally ContactDialog should accept a generic item or we make a new one.
        // For now, let's assume we can cast Service to Product-like object for the dialog, 
        // or we might need to update ContactDialog.
        // Let's create a temporary object that satisfies the minimum useful fields
        const productLike = {
            ...service,
            category: 'other' as any, // valid enum value
            brand: 'other' as any,
            specifications: {},
            in_stock: true
        };

        setContactService(productLike as any);
        setContactDialogOpen(true);
    };

    // Build page title
    const pageTitle = currentSubcategory
        ? currentSubcategory.name
        : currentCategory
            ? currentCategory.name
            : 'All Services';

    return (
        <MainLayout>
            <div className="container py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
                    <Link to="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Services</span>
                    {currentCategory && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <Link
                                to={`/services/${currentCategory.slug}`}
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
                        {services && (
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {services.length} services
                            </Badge>
                        )}
                    </div>

                    {/* Subcategory pills */}
                    {currentCategory && categorySubcategories.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Subcategories:</p>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    to={`/services/${currentCategory.slug}`}
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
                                        to={`/services/${currentCategory.slug}/${sub.slug}`}
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
                </div>

                {/* Services Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-video rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : services && services.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onContactClick={handleContactClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                            No services found
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            We don't have any services in this category yet.
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
                product={contactService as any}
                open={contactDialogOpen}
                onOpenChange={setContactDialogOpen}
            />
        </MainLayout>
    );
}
