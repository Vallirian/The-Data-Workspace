"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";

// Initialize Firebase
if (!getApps().length) {
	initializeApp({
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		// ...other required fields...
	});
}

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
