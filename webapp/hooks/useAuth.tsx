"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe(); // Cleanup subscription on unmount
	}, []);

	return { user, loading };
}
