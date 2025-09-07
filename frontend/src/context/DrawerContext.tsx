import { createContext, useContext, useState, ReactNode } from 'react';
import ProfileDrawer from '../components/ProfileDrawer';

type DrawerCtx = { open: () => void };
const DrawerContext = createContext<DrawerCtx | undefined>(undefined);

const mockUser = {
  name: 'Gisele',
  email: 'karyna@shops.com.br',
  phone: '(21) 3215-8788',
  cell: '(21) 98664-8888',
  avatar: 'https://i.pravatar.cc/150?img=5',
};

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = { open: () => setOpen(true) };
  return (
    <DrawerContext.Provider value={value}>
      {children}
      {open && <ProfileDrawer user={mockUser} onClose={() => setOpen(false)} />}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be within DrawerProvider');
  return ctx;
};
