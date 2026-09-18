import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    actual_price: number;
    thumbnail_image: string;
  };
  size: string;
  color: { name: string; hex: string };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  newItemId: string | null;
  addToCart: (item: Omit<CartItem, 'id'>) => string;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  clearNewItemId: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  const addToCart = (item: Omit<CartItem, 'id'>): string => {
    // Check if item already exists
    const existingItemIndex = items.findIndex(
      i => i.product.id === item.product.id && 
           i.size === item.size && 
           i.color.name === item.color.name
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
      
      const itemId = updatedItems[existingItemIndex].id;
      setNewItemId(itemId);
      setIsOpen(true);
      return itemId;
    } else {
      // Add new item
      const itemId = `cart-${Date.now()}-${Math.random()}`;
      const newItem: CartItem = { ...item, id: itemId };
      setItems([...items, newItem]);
      setNewItemId(itemId);
      setIsOpen(true);
      return itemId;
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const clearNewItemId = () => setNewItemId(null);
  const clearCart = () => {
    setItems([]);
    setNewItemId(null);
  };
  
  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      newItemId,
      addToCart,
      updateQuantity,
      removeItem,
      openCart,
      closeCart,
      clearNewItemId,
      clearCart,
    }}>
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
