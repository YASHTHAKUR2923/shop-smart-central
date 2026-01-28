import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/database';

interface QuoteCartItem extends Product {
    quantity: number;
}

interface QuoteCartContextType {
    items: QuoteCartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    decreaseItem: (productId: string) => void;
    clearCart: () => void;
    itemCount: number;
}

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

export function QuoteCartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<QuoteCartItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('quoteCart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse quote cart', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('quoteCart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const decreaseItem = (productId: string) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            // If quantity is 1, remove it? Or just do nothing? usually remove.
            return prev.filter(item => item.id !== productId);
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <QuoteCartContext.Provider value={{ items, addItem, removeItem, decreaseItem, clearCart, itemCount }}>
            {children}
        </QuoteCartContext.Provider>
    );
}

export function useQuoteCart() {
    const context = useContext(QuoteCartContext);
    if (context === undefined) {
        throw new Error('useQuoteCart must be used within a QuoteCartProvider');
    }
    return context;
}
