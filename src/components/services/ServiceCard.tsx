import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Check } from 'lucide-react';
import { Service } from '@/hooks/useServices';

interface ServiceCardProps {
    service: Service;
    onContactClick: (service: Service) => void;
}

export function ServiceCard({ service, onContactClick }: ServiceCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {service.image_url ? (
                    <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>

            <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <Link to={`/service/${service.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                            {service.name}
                        </h3>
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {service.description}
                </p>

                {service.show_price && service.price && (
                    <div className="mt-auto">
                        <span className="text-lg font-bold text-primary">
                            ₹{service.price.toLocaleString('en-IN')}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    className="w-full"
                    asChild
                >
                    <Link to={`/service/${service.id}`}>
                        Details
                    </Link>
                </Button>
                <Button
                    className="w-full"
                    onClick={() => onContactClick(service)}
                >
                    <Phone className="w-4 h-4 mr-2" />
                    Enquire
                </Button>
            </CardFooter>
        </Card>
    );
}
