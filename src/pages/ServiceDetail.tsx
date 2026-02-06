import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ContactDialog } from '@/components/products/ContactDialog';
import { useService } from '@/hooks/useServices';
import { ChevronRight, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: service, isLoading } = useService(id || '');
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="container py-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="aspect-video rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!service) {
        return (
            <MainLayout>
                <div className="container py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                    <Link to="/services" className="text-primary hover:underline">
                        Back to Services
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const handleContactClick = () => {
        setContactDialogOpen(true);
    };

    const productLike = {
        ...service,
        category: 'other' as any,
        brand: 'other' as any,
        specifications: {},
        in_stock: true
    };

    return (
        <MainLayout>
            <div className="container py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
                    <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to="/services" className="hover:text-foreground transition-colors">Services</Link>
                    {service.category && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-muted-foreground">{service.category.name}</span>
                        </>
                    )}
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium">{service.name}</span>
                </nav>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image */}
                    <div className="rounded-lg overflow-hidden border bg-muted aspect-video self-start">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                            {service.name}
                        </h1>

                        {service.show_price && service.price && (
                            <div className="text-2xl font-bold text-primary mb-6">
                                ₹{service.price.toLocaleString('en-IN')}
                            </div>
                        )}

                        <div className="prose prose-sm max-w-none text-muted-foreground mb-8">
                            <p>{service.description}</p>
                        </div>

                        <Button size="lg" className="w-full md:w-auto" onClick={handleContactClick}>
                            <Phone className="w-4 h-4 mr-2" />
                            Enquire Now
                        </Button>
                    </div>
                </div>
            </div>

            <ContactDialog
                product={productLike as any}
                open={contactDialogOpen}
                onOpenChange={setContactDialogOpen}
            />
        </MainLayout>
    );
}
