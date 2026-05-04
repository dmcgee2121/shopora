import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MiniCartContext = createContext(null);

export function MiniCartProvider({ children }) {
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const openMiniCart = useCallback(() => setIsMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);
  const toggleMiniCart = useCallback(() => setIsMiniCartOpen((current) => !current), []);

  const value = useMemo(
    () => ({
      isMiniCartOpen,
      openMiniCart,
      closeMiniCart,
      toggleMiniCart,
    }),
    [isMiniCartOpen, openMiniCart, closeMiniCart, toggleMiniCart],
  );

  return <MiniCartContext.Provider value={value}>{children}</MiniCartContext.Provider>;
}

export function useMiniCart() {
  const context = useContext(MiniCartContext);
  if (!context) {
    throw new Error('useMiniCart must be used within a MiniCartProvider');
  }
  return context;
}
