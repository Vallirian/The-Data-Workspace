import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth"; // Import necessary Firebase auth utilities
import { auth } from "@/services/firebase";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ArcAvatar() {
    const [user, setUser] = useState<User | null>(null);

    // Fetch the authenticated user's info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set the user when authenticated
        });

        return () => unsubscribe(); // Cleanup the subscription
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarImage alt={user?.displayName || "User"} />
                    <AvatarFallback>
                        {user?.displayName ? user.displayName.charAt(0) : "U"}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    {user?.displayName || "User"}
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
                <DropdownMenuItem>Used Token: -- / --</DropdownMenuItem>
                <DropdownMenuItem>Used Data: -- / --</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
