
'use client';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

type AuthListenerProps = {
    onLogin: (user: User) => void;
    onLogout: () => void;
};

export function useAuthListener({ onLogin, onLogout }: AuthListenerProps) {
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(authUser => {
            if (authUser) {
                onLogin(authUser);
            } else {
                onLogout();
            }
        });

        return () => unsubscribe();
    }, [onLogin, onLogout]);
}
