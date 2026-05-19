import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../../../shared/src/models';
import { getUser } from '../api/authApi';

type UserContextState = {
  user: User | null;
  setUser: (user: User | null) => void;
  feedRadiusKm: number;
  setFeedRadiusKm: (radius: number) => void;
  businessRadiusKm: number;
  setBusinessRadiusKm: (radius: number) => void;
};

const UserContext = createContext<UserContextState | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [feedRadiusKm, setFeedRadiusKm] = useState(3);
  const [businessRadiusKm, setBusinessRadiusKm] = useState(3);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      getUser(userId)
        .then(({ user: loadedUser }) => setUser(loadedUser))
        .catch(() => {
          localStorage.removeItem('userId');
          setUser(null);
        });
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, feedRadiusKm, setFeedRadiusKm, businessRadiusKm, setBusinessRadiusKm }),
    [user, feedRadiusKm, businessRadiusKm]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextState {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used inside UserProvider');
  }
  return context;
}
