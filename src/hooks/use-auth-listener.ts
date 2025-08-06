
'use client';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

type AuthListenerProps = {
    onLogin: (user: User) => void;
    onLogout: () => void;
};

export function useAuthListener({ onLogin, onLogout }: AuthListenerProps) {
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(authUser => {
            if (authUser) {
                if (!user) { // User logged in
                    onLogin(authUser);
                }
                setUser(authUser);
            } else {
                if (user) { // User logged out
                    onLogout();
                }
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, [onLogin, onLogout, user]);
}
