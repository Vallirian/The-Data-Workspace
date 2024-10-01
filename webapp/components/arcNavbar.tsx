"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation"; // Import usePathname
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

export default function ArcNavbar() {

    function UserDropdown() {
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
                        <AvatarImage
                            alt={user?.displayName || "User"}
                        />
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

    const pathname = usePathname(); // Get the current path
    const pathSegments = pathname.split("/").filter((segment) => segment);

    return (
        <nav className="p-4 flex justify-between items-center">
            <BreadcrumbItem>
                <BreadcrumbLink href="/workbooks">Workbooks</BreadcrumbLink>
            </BreadcrumbItem>
            <UserDropdown />
        </nav>
    );
}
