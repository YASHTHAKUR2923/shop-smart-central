import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateInquiry } from '@/hooks/useInquiries';
import { toast } from 'sonner';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
    const { items, addItem, removeItem, decreaseItem, clearCart } = useQuoteCart();
    const [view, setView] = useState<'cart' | 'form'>('cart');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const createInquiry = useCreateInquiry();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createInquiry.mutateAsync({
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                message: formData.message,
                cart_items: items
            });

            // Success handled by hook, but we need to clear cart and close
            clearCart();
            setFormData({ name: '', email: '', phone: '', message: '' });
            setView('cart');
            onOpenChange(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleOpenChangeInternal = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset view when closing
            setView('cart');
        }
        onOpenChange(newOpen);
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChangeInternal}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {view === 'form' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={() => setView('cart')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {view === 'cart' ? (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Your Quote Cart
                            </>
                        ) : (
                            "Request Quote"
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {view === 'cart' ? (
                        items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b pb-4">
                                        <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{item.name}</h4>
                                            {item.model_no && (
                                                <p className="text-xs text-muted-foreground mb-1">Model: {item.model_no}</p>
                                            )}

                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center border rounded-md">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none border-r"
                                                        onClick={() => decreaseItem(item.id)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none border-l"
                                                        onClick={() => addItem(item)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <form id="quote-form" onSubmit={handleSubmit} className="space-y-4 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Your Phone Number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Any specific requirements or questions?"
                                    className="min-h-[100px]"
                                />
                            </div>
                        </form>
                    )}
                </div>

                <SheetFooter className="border-t pt-4">
                    {view === 'cart' ? (
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={items.length === 0}
                            onClick={() => setView('form')}
                        >
                            Request Quote
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="quote-form"
                            className="w-full"
                            size="lg"
                            disabled={createInquiry.isPending}
                        >
                            {createInquiry.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
