import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  useCategories, 
  useBrands, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  CustomCategory,
  CustomBrand,
} from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, FolderTree, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

interface BrandFormData {
  name: string;
  slug: string;
  logo_url: string;
  display_order: number;
}

const defaultCategoryForm: CategoryFormData = {
  name: '',
  slug: '',
  icon: 'Package',
  description: '',
  display_order: 0,
};

const defaultBrandForm: BrandFormData = {
  name: '',
  slug: '',
  logo_url: '',
  display_order: 0,
};

export default function AdminCategories() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [editingBrand, setEditingBrand] = useState<CustomBrand | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);
  const [brandForm, setBrandForm] = useState<BrandFormData>(defaultBrandForm);

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

  const handleOpenCategoryEdit = (category: CustomCategory) => {
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
    if (confirm('Are you sure? Products using this category may be affected.')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('Category deleted');
      } catch (error: any) {
        toast.error(error.message || 'Error deleting category');
      }
    }
  };

  // Brand handlers
  const handleOpenBrandCreate = () => {
    setEditingBrand(null);
    setBrandForm(defaultBrandForm);
    setBrandDialogOpen(true);
  };

  const handleOpenBrandEdit = (brand: CustomBrand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url || '',
      display_order: brand.display_order,
    });
    setBrandDialogOpen(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({ id: editingBrand.id, ...brandForm });
        toast.success('Brand updated');
      } else {
        await createBrand.mutateAsync(brandForm);
        toast.success('Brand created');
      }
      setBrandDialogOpen(false);
      setBrandForm(defaultBrandForm);
    } catch (error: any) {
      toast.error(error.message || 'Error saving brand');
    }
  };

  const handleBrandDelete = async (id: string) => {
    if (confirm('Are you sure? Products using this brand may be affected.')) {
      try {
        await deleteBrand.mutateAsync(id);
        toast.success('Brand deleted');
      } catch (error: any) {
        toast.error(error.message || 'Error deleting brand');
      }
    }
  };

  const isLoading = categoriesLoading || brandsLoading;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Manage Categories & Brands
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or remove product categories and brands
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="brands" className="gap-2">
              <Tag className="w-4 h-4" />
              Brands
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenCategoryCreate} className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
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
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createCategory.isPending || updateCategory.isPending}>
                        {(createCategory.isPending || updateCategory.isPending) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
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
              <div className="border rounded-lg overflow-hidden">
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
            )}
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands">
            <div className="flex justify-end mb-4">
              <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenBrandCreate} className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Brand
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                    <DialogDescription>Enter the brand details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBrandSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand-name">Name *</Label>
                      <Input
                        id="brand-name"
                        value={brandForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setBrandForm(prev => ({ 
                            ...prev, 
                            name,
                            slug: editingBrand ? prev.slug : generateSlug(name),
                          }));
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand-slug">Slug *</Label>
                      <Input
                        id="brand-slug"
                        value={brandForm.slug}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand-logo">Logo URL</Label>
                      <Input
                        id="brand-logo"
                        type="url"
                        value={brandForm.logo_url}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand-order">Display Order</Label>
                      <Input
                        id="brand-order"
                        type="number"
                        value={brandForm.display_order}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBrandDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createBrand.isPending || updateBrand.isPending}>
                        {(createBrand.isPending || updateBrand.isPending) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : editingBrand ? 'Update' : 'Create'}
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
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands?.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                        <TableCell>{brand.display_order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenBrandEdit(brand)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleBrandDelete(brand.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}