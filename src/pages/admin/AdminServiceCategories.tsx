import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    useServiceCategories,
    useCreateServiceCategory,
    useUpdateServiceCategory,
    useDeleteServiceCategory,
    useAllServiceSubcategories,
    useCreateServiceSubcategory,
    useUpdateServiceSubcategory,
    useDeleteServiceSubcategory,
    ServiceCategory,
    ServiceSubcategory,
} from '@/hooks/useServiceCategories';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, FolderTree, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryFormData {
    name: string;
    slug: string;
    icon: string;
    description: string;
    display_order: number;
}

const defaultCategoryForm: CategoryFormData = {
    name: '',
    slug: '',
    icon: 'Package',
    description: '',
    display_order: 0,
};

interface SubcategoryFormData {
    name: string;
    slug: string;
    category_id: string;
    display_order: number;
}

const defaultSubcategoryForm: SubcategoryFormData = {
    name: '',
    slug: '',
    category_id: '',
    display_order: 0,
};

export default function AdminServiceCategories() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const { data: categories, isLoading: categoriesLoading } = useServiceCategories();
    const { data: subcategories, isLoading: subcategoriesLoading } = useAllServiceSubcategories();

    const createCategory = useCreateServiceCategory();
    const updateCategory = useUpdateServiceCategory();
    const deleteCategory = useDeleteServiceCategory();
    const createSubcategory = useCreateServiceSubcategory();
    const updateSubcategory = useUpdateServiceSubcategory();
    const deleteSubcategory = useDeleteServiceSubcategory();

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<(ServiceSubcategory & { category?: { id: string; name: string; slug: string } }) | null>(null);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);
    const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormData>(defaultSubcategoryForm);

    if (authLoading) return null;
    if (!isAdmin) return <Navigate to="/" replace />;

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    };

    // Category handlers
    const handleOpenCategoryCreate = () => {
        setEditingCategory(null);
        setCategoryForm(defaultCategoryForm);
        setCategoryDialogOpen(true);
    };

    const handleOpenCategoryEdit = (category: ServiceCategory) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            icon: category.icon || 'Package',
            description: category.description || '',
            display_order: category.display_order,
        });
        setCategoryDialogOpen(true);
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryForm });
                toast.success('Category updated');
            } else {
                await createCategory.mutateAsync(categoryForm);
                toast.success('Category created');
            }
            setCategoryDialogOpen(false);
            setCategoryForm(defaultCategoryForm);
        } catch (error: any) {
            toast.error(error.message || 'Error saving category');
        }
    };

    const handleCategoryDelete = async (id: string) => {
        if (confirm('Are you sure? Services using this category may be affected.')) {
            try {
                await deleteCategory.mutateAsync(id);
                toast.success('Category deleted');
            } catch (error: any) {
                toast.error(error.message || 'Error deleting category');
            }
        }
    };


    // Subcategory handlers
    const handleOpenSubcategoryCreate = () => {
        setEditingSubcategory(null);
        setSubcategoryForm(defaultSubcategoryForm);
        setSubcategoryDialogOpen(true);
    };

    const handleOpenSubcategoryEdit = (subcategory: ServiceSubcategory & { category?: { id: string; name: string; slug: string } }) => {
        setEditingSubcategory(subcategory);
        setSubcategoryForm({
            name: subcategory.name,
            slug: subcategory.slug,
            category_id: subcategory.category_id,
            display_order: subcategory.display_order,
        });
        setSubcategoryDialogOpen(true);
    };

    const handleSubcategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSubcategory) {
                await updateSubcategory.mutateAsync({ id: editingSubcategory.id, ...subcategoryForm });
                toast.success('Subcategory updated');
            } else {
                await createSubcategory.mutateAsync(subcategoryForm);
                toast.success('Subcategory created');
            }
            setSubcategoryDialogOpen(false);
            setSubcategoryForm(defaultSubcategoryForm);
        } catch (error: any) {
            toast.error(error.message || 'Error saving subcategory');
        }
    };

    const handleSubcategoryDelete = async (id: string) => {
        if (confirm('Are you sure? Services using this subcategory may be affected.')) {
            try {
                await deleteSubcategory.mutateAsync(id);
                toast.success('Subcategory deleted');
            } catch (error: any) {
                toast.error(error.message || 'Error deleting subcategory');
            }
        }
    };

    const isLoading = categoriesLoading || subcategoriesLoading;

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Manage Service Categories & Subcategories
                    </h1>
                    <p className="text-muted-foreground">
                        Add, edit, or remove service categories and subcategories
                    </p>
                </div>

                <Tabs defaultValue="categories" className="space-y-6">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="categories" className="gap-2 flex-1 sm:flex-initial">
                            <FolderTree className="w-4 h-4" />
                            <span className="hidden sm:inline">Categories</span>
                            <span className="sm:hidden">Cats</span>
                        </TabsTrigger>
                        <TabsTrigger value="subcategories" className="gap-2 flex-1 sm:flex-initial">
                            <Layers className="w-4 h-4" />
                            <span className="hidden sm:inline">Subcategories</span>
                            <span className="sm:hidden">Subs</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Categories Tab */}
                    <TabsContent value="categories">
                        <div className="flex justify-end mb-4">
                            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={handleOpenCategoryCreate} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                                        <DialogDescription>Enter the category details</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-name">Name *</Label>
                                            <Input
                                                id="cat-name"
                                                value={categoryForm.name}
                                                onChange={(e) => {
                                                    const name = e.target.value;
                                                    setCategoryForm(prev => ({
                                                        ...prev,
                                                        name,
                                                        slug: editingCategory ? prev.slug : generateSlug(name),
                                                    }));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-slug">Slug *</Label>
                                            <Input
                                                id="cat-slug"
                                                value={categoryForm.slug}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-icon">Icon Name</Label>
                                            <Input
                                                id="cat-icon"
                                                value={categoryForm.icon}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                                                placeholder="Laptop, Monitor, Server, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-desc">Description</Label>
                                            <Textarea
                                                id="cat-desc"
                                                value={categoryForm.description}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-order">Display Order</Label>
                                            <Input
                                                id="cat-order"
                                                type="number"
                                                value={categoryForm.display_order}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)} className="flex-1">
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex-1" disabled={createCategory.isPending || updateCategory.isPending}>
                                                {(createCategory.isPending || updateCategory.isPending) ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : editingCategory ? 'Update' : 'Create'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Icon</TableHead>
                                                <TableHead>Order</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories?.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                                    <TableCell>{category.icon}</TableCell>
                                                    <TableCell>{category.display_order}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryEdit(category)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleCategoryDelete(category.id)}>
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {categories?.map((category) => (
                                        <Card key={category.id} className="border-border/50">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground mb-1 break-words">{category.name}</h3>
                                                        <p className="text-sm text-muted-foreground break-all">{category.slug}</p>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 ml-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryEdit(category)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleCategoryDelete(category.id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">Icon</p>
                                                        <p className="font-medium">{category.icon || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">Order</p>
                                                        <p className="font-medium">{category.display_order}</p>
                                                    </div>
                                                </div>
                                                {category.description && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-sm text-muted-foreground break-words">{category.description}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Subcategories Tab */}
                    <TabsContent value="subcategories">
                        <div className="flex justify-end mb-4">
                            <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={handleOpenSubcategoryCreate} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Subcategory
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
                                        <DialogDescription>Enter the subcategory details</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sub-category">Parent Category *</Label>
                                            <select
                                                id="sub-category"
                                                value={subcategoryForm.category_id}
                                                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, category_id: e.target.value }))}
                                                required
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="">Select a category</option>
                                                {categories?.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sub-name">Name *</Label>
                                            <Input
                                                id="sub-name"
                                                value={subcategoryForm.name}
                                                onChange={(e) => {
                                                    const name = e.target.value;
                                                    setSubcategoryForm(prev => ({
                                                        ...prev,
                                                        name,
                                                        slug: editingSubcategory ? prev.slug : generateSlug(name),
                                                    }));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sub-slug">Slug *</Label>
                                            <Input
                                                id="sub-slug"
                                                value={subcategoryForm.slug}
                                                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sub-order">Display Order</Label>
                                            <Input
                                                id="sub-order"
                                                type="number"
                                                value={subcategoryForm.display_order}
                                                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setSubcategoryDialogOpen(false)} className="flex-1">
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex-1" disabled={createSubcategory.isPending || updateSubcategory.isPending}>
                                                {(createSubcategory.isPending || updateSubcategory.isPending) ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : editingSubcategory ? 'Update' : 'Create'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Order</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subcategories?.map((subcategory) => (
                                                <TableRow key={subcategory.id}>
                                                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{subcategory.slug}</TableCell>
                                                    <TableCell>{subcategory.category?.name || 'N/A'}</TableCell>
                                                    <TableCell>{subcategory.display_order}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenSubcategoryEdit(subcategory)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleSubcategoryDelete(subcategory.id)}>
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {subcategories?.map((subcategory) => (
                                        <Card key={subcategory.id} className="border-border/50">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground mb-1 break-words">{subcategory.name}</h3>
                                                        <p className="text-sm text-muted-foreground break-all">{subcategory.slug}</p>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 ml-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenSubcategoryEdit(subcategory)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleSubcategoryDelete(subcategory.id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">Category</p>
                                                        <p className="font-medium">{subcategory.category?.name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">Order</p>
                                                        <p className="font-medium">{subcategory.display_order}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
