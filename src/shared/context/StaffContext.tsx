import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UsersAPI, AppUser } from '../api/api';

interface StaffContextValue {
  staff:       AppUser[];
  loading:     boolean;
  error:       string | null;
  fetchStaff:  () => Promise<void>;
  addStaff:    (t: AppUser) => void;
  updateStaff: (t: AppUser) => void;
  deleteStaff: (id: number) => void;
}

const StaffContext = createContext<StaffContextValue>({
  staff:       [],
  loading:     false,
  error:       null,
  fetchStaff:  async () => {},
  addStaff:    () => {},
  updateStaff: () => {},
  deleteStaff: () => {},
});

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff,   setStaff]   = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

const fetchStaff = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await UsersAPI.getTechnicians();
    setStaff(Array.isArray(data) ? data : (data as any).results ?? []);
  } catch (e: any) {
    setError(e?.message ?? 'Something went wrong');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const addStaff    = (t: AppUser) => setStaff(prev => [t, ...prev]);
  const updateStaff = (t: AppUser) => setStaff(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteStaff = (id: number) => setStaff(prev => prev.filter(x => x.id !== id));

  return (
    <StaffContext.Provider value={{ staff, loading, error, fetchStaff, addStaff, updateStaff, deleteStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaffContext = () => useContext(StaffContext);