import React, { createContext, useContext, useState } from 'react';
import { IS_MOCK } from '../api/api';

export type QuotaPlan = 'ANONYMOUS' | 'FREE' | null;

export interface QuotaState {
  plan:         QuotaPlan;
  requestsUsed: number;
  limit:        number;
}

interface QuotaContextType {
  quotaExceeded:    boolean;
  quotaState:       QuotaState;
  setQuotaExceeded: (exceeded: boolean, state?: Partial<QuotaState>) => void;
}

const DEFAULT_STATE: QuotaState = { plan: null, requestsUsed: 0, limit: 0 };

const QuotaContext = createContext<QuotaContextType>({
  quotaExceeded:    false,
  quotaState:       DEFAULT_STATE,
  setQuotaExceeded: () => {},
});

export function QuotaProvider({ children }: { children: React.ReactNode }) {
  const [quotaExceeded, setExceeded] = useState(false);
  const [quotaState,    setQState]   = useState<QuotaState>(DEFAULT_STATE);

  const setQuotaExceeded = (exceeded: boolean, state?: Partial<QuotaState>) => {
    setExceeded(exceeded);
    if (exceeded && state) {
      setQState(prev => ({ ...prev, ...state }));
    } else if (!exceeded) {
      setQState(DEFAULT_STATE);
    }
  };

  if (!IS_MOCK) return <>{children}</>;

  return (
    <QuotaContext.Provider value={{ quotaExceeded, quotaState, setQuotaExceeded }}>
      {children}
    </QuotaContext.Provider>
  );
}

export const useQuota = () => useContext(QuotaContext);