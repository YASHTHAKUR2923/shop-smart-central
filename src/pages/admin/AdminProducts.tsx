import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  Product,
  ProductCategory,
  Brand,
  CATEGORY_LABELS,
  BRAND_LABELS
} from '@/types/database';
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  brand: Brand;
  price: string;
  show_price: boolean;
  image_url: string;
  in_stock: boolean;
  custom_category_id: string;
  custom_subcategory_id: string;
  model_no: string;
  additional_images: string[];
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  category: 'other', // Default to other as this is hidden
  brand: 'dell',
  price: '',
  show_price: false,
  image_url: '',
  in_stock: true,
  custom_category_id: '',
  custom_subcategory_id: '',
  model_no: '',
  additional_images: [],
};

export default function AdminProducts() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  // Get subcategories for selected category (must be after formData declaration)
  const filteredSubcategories = subcategories?.filter(
    s => s.category_id === formData.custom_category_id
  ) || [];

  if (authLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      brand: product.brand,
      price: product.price?.toString() || '',
      show_price: product.show_price,
      image_url: product.image_url || '',
      in_stock: product.in_stock,
      custom_category_id: (product as any).custom_category_id || '',
      custom_subcategory_id: (product as any).custom_subcategory_id || '',
      model_no: product.model_no || '',
      additional_images: product.additional_images || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      brand: formData.brand,
      price: formData.price ? parseFloat(formData.price) : null,
      show_price: formData.show_price,
      image_url: formData.image_url || null,
      in_stock: formData.in_stock,
      model_no: formData.model_no || null,
      additional_images: formData.additional_images,
      specifications: {},
      custom_category_id: formData.custom_category_id || null,
      custom_subcategory_id: formData.custom_subcategory_id || null,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
      } else {
        await createProduct.mutateAsync(productData);
      }
      setDialogOpen(false);
      setFormData(defaultFormData);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  // ... existing code ...

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Manage Products
            </h1>
            <p className="text-muted-foreground">
              Add, edit, or remove products from your catalog
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the product details below
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dell Latitude 5540"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value: Brand) => setFormData(prev => ({ ...prev, brand: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(BRAND_LABELS) as Brand[]).map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {BRAND_LABELS[brand]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom_category">Category *</Label>
                    <Select
                      value={formData.custom_category_id}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        custom_category_id: value,
                        custom_subcategory_id: '' // Reset subcategory when category changes
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_subcategory">Subcategory</Label>
                    <Select
                      value={formData.custom_subcategory_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, custom_subcategory_id: value }))}
                      disabled={!formData.custom_category_id || filteredSubcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filteredSubcategories.length === 0 ? "No subcategories" : "Select subcategory"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center gap-2 pb-2 w-full">
                      <Switch
                        id="show_price"
                        checked={formData.show_price}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_price: checked }))}
                      />
                      <Label htmlFor="show_price" className="text-sm">Show price publicly</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_no">Model / Part No</Label>
                  <Input
                    id="model_no"
                    value={formData.model_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, model_no: e.target.value }))}
                    placeholder="e.g. A1234, XPS-15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_images">Additional Photos/Videos (URLs comma separated)</Label>
                  <Textarea
                    id="additional_images"
                    value={formData.additional_images.join(', ')}
                    onChange={(e) => {
                      const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, additional_images: urls }));
                    }}
                    placeholder="https://example.com/photo1.jpg, https://example.com/video.mp4"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Enter URLs separated by commas. Videos will be auto-detected.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.custom_category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>{BRAND_LABELS[product.brand]}</TableCell>
                      <TableCell>
                        {product.show_price && product.price
                          ? formatPrice(product.price)
                          : <span className="text-muted-foreground">Hidden</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteProduct.isPending}
                          >
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
              {products.map((product) => (
                <Card key={product.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4 mb-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 break-words">{product.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {product.custom_category?.name || 'Uncategorized'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {BRAND_LABELS[product.brand]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Price</p>
                        <p className="font-medium">
                          {product.show_price && product.price
                            ? formatPrice(product.price)
                            : <span className="text-muted-foreground">Hidden</span>
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Status</p>
                        <Badge variant={product.in_stock ? 'default' : 'destructive'} className="text-xs">
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(product)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No products yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Add your first product to get started.
            </p>
            <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
