import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Customer, CustomersAPI } from '../api/api';

interface CustomerContextValue {
  customers:      Customer[];
  loading:        boolean;
  error:          string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer:    (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: number) => void;
}

const CustomerContext = createContext<CustomerContextValue>({
  customers:      [],
  loading:        false,
  error:          null,
  fetchCustomers: async () => {},
  addCustomer:    () => {},
  updateCustomer: () => {},
  deleteCustomer: () => {},
});

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

const fetchCustomers = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await CustomersAPI.getAll();
    setCustomers(Array.isArray(data) ? data : (data as any).results ?? []);
  } catch (e: any) {
    setError(e?.message ?? 'Something went wrong');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const addCustomer    = (c: Customer) => setCustomers(prev => [c, ...prev]);
  const updateCustomer = (c: Customer) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCustomer = (id: number)  => setCustomers(prev => prev.filter(x => x.id !== id));

  return (
    <CustomerContext.Provider value={{ customers, loading, error, fetchCustomers, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomerContext = () => useContext(CustomerContext);