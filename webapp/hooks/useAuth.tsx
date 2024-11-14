import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return { user, loading };
}
