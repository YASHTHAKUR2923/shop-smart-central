import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useServices,
    useCreateService,
    useUpdateService,
    useDeleteService,
    Service,
} from '@/hooks/useServices';
import { useServiceCategories, useServiceSubcategories } from '@/hooks/useServiceCategories';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceFormData {
    name: string;
    description: string;
    category_id: string;
    subcategory_id: string;
    price: string;
    show_price: boolean;
    image_url: string;
    is_active: boolean;
}

const defaultServiceForm: ServiceFormData = {
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    price: '',
    show_price: false,
    image_url: '',
    is_active: true,
};

export default function AdminServices() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const { data: services, isLoading: servicesLoading } = useServices();
    const { data: categories } = useServiceCategories();
    const { data: subcategories } = useServiceSubcategories();

    const createService = useCreateService();
    const updateService = useUpdateService();
    const deleteService = useDeleteService();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>(defaultServiceForm);
    const [searchTerm, setSearchTerm] = useState('');

    if (authLoading) return null;
    if (!isAdmin) return <Navigate to="/" replace />;

    const handleOpenCreate = () => {
        setEditingService(null);
        setFormData(defaultServiceForm);
        setDialogOpen(true);
    };

    const handleOpenEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            category_id: service.category_id || '',
            subcategory_id: service.subcategory_id || '',
            price: service.price ? service.price.toString() : '',
            show_price: service.show_price,
            image_url: service.image_url || '',
            is_active: service.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const serviceData = {
                name: formData.name,
                description: formData.description || null,
                category_id: formData.category_id || null,
                subcategory_id: formData.subcategory_id || null,
                price: formData.price ? parseFloat(formData.price) : null,
                show_price: formData.show_price,
                image_url: formData.image_url || null,
                is_active: formData.is_active,
            };

            if (editingService) {
                await updateService.mutateAsync({ id: editingService.id, ...serviceData });
                toast.success('Service updated');
            } else {
                await createService.mutateAsync(serviceData);
                toast.success('Service created');
            }
            setDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error saving service');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService.mutateAsync(id);
                toast.success('Service deleted');
            } catch (error: any) {
                toast.error(error.message || 'Error deleting service');
            }
        }
    };

    const filteredServices = services?.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter subcategories based on selected category
    const filteredSubcategories = subcategories?.filter(sub =>
        !formData.category_id || sub.category_id === formData.category_id
    );

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                            Manage Services
                        </h1>
                        <p className="text-muted-foreground">
                            Add, edit, or remove services from your catalog
                        </p>
                    </div>
                    <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 max-w-sm"
                        />
                    </div>
                </div>

                {servicesLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredServices?.map((service) => {
                                    const categoryName = categories?.find(c => c.id === service.category_id)?.name;
                                    const subcategoryName = subcategories?.find(s => s.id === service.subcategory_id)?.name;

                                    return (
                                        <TableRow key={service.id}>
                                            <TableCell>
                                                <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                                                    {service.image_url && (
                                                        <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{categoryName || '-'}</span>
                                                    <span className="text-xs text-muted-foreground">{subcategoryName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {service.price ? `₹${service.price.toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                    {service.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(service)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredServices?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No services found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
                            <DialogDescription>Enter the service details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="s-name">Name *</Label>
                                <Input
                                    id="s-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val, subcategory_id: '' }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subcategory</Label>
                                    <Select
                                        value={formData.subcategory_id}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, subcategory_id: val }))}
                                        disabled={!formData.category_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSubcategories?.map((sub) => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-price">Price (₹)</Label>
                                <Input
                                    id="s-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-image">Image URL</Label>
                                <Input
                                    id="s-image"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-desc">Description</Label>
                                <Textarea
                                    id="s-desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Show Price</Label>
                                    <p className="text-sm text-muted-foreground">Display price to customers</p>
                                </div>
                                <Switch
                                    checked={formData.show_price}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_price: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Active Status</Label>
                                    <p className="text-sm text-muted-foreground">Visible to customers</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                                    {(createService.isPending || updateService.isPending) && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    Save Service
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
