import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderSummary {
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
}

interface OrderContextType {
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within OrderProvider');
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  return (
    <OrderContext.Provider value={{ orderSummary, setOrderSummary }}>
      {children}
    </OrderContext.Provider>
  );
}; 