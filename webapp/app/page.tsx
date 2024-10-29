"use client";

import * as React from "react";
import WorkbooksPage from "./app/workbooks/page";
import { useRouter } from "next/navigation";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import LoginPageWrapper from "./app/account/(signup-or-login)/login/page";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in
                setUser(currentUser);

                // Redirect to Workbooks page if logged in
                router.push("/app/workbooks");
            } else {
                // No user is signed in
                setUser(null);
                // Redirect to login page if not logged in
                router.push("/app/account/login");
            }
            setLoading(false);
        });

        // Clean up the subscription on unmount
        return () => unsubscribe();
    }, [router]);

    if (loading) {
        // Optionally render a loading state
        return <div>Loading...</div>;
    }

    // Optionally render the WorkbooksPage if we choose not to use redirects
    return user ? <WorkbooksPage /> : <LoginPageWrapper />;
}
