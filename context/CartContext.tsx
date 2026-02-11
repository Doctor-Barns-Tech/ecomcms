'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
    slug: string;
    maxStock: number;
    moq?: number; // Minimum Order Quantity
};

export type CartContextType = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, variant?: string) => void;
    updateQuantity: (itemId: string, quantity: number, variant?: string) => void;
    clearCart: () => void;
    cartCount: number;
    subtotal: number;
    shipping: number;
    total: number;
    coupon: { code: string; amount: number } | null;
    applyCoupon: (code: string) => void;
    removeCoupon: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [coupon, setCoupon] = useState<{ code: string; amount: number } | null>(null);

    // Initial Load
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart:', e);
            }
        }
    }, []);

    // Save cart
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) => item.id === newItem.id && item.variant === newItem.variant
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += newItem.quantity;
                return newCart;
            } else {
                return [...prevCart, newItem];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId: string, variant?: string) => {
        setCart((prevCart) => prevCart.filter((item) => !(item.id === itemId && item.variant === variant)));
    };

    const updateQuantity = (itemId: string, quantity: number, variant?: string) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId && item.variant === variant
                    ? { ...item, quantity: Math.max(0, quantity) }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const applyCoupon = (code: string) => {
        // Mock coupon logic
        if (code === 'WELCOME20') {
            setCoupon({ code, amount: 20 });
        } else {
            alert('Invalid coupon code');
        }
    };

    const removeCoupon = () => setCoupon(null);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + shipping - (coupon?.amount || 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                subtotal,
                shipping,
                total,
                coupon,
                applyCoupon,
                removeCoupon,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
