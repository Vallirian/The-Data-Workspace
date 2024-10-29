import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth"; // Import necessary Firebase auth utilities
import { auth } from "@/services/firebase";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/services/axios";
import { UserInfoInterface } from "@/interfaces/main";
import { useRouter } from "next/navigation";

export default function ArcAvatar() {
    const [user, setUser] = useState<User | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);
    const router = useRouter(); 

    // Fetch the authenticated user's info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set the user when authenticated
        });

        return () => unsubscribe(); // Cleanup the subscription
    }, []);

    // get account info
    useEffect(() => {
        if (user) {
            fetchUserInfo();
        }
    }, [user]);
    const fetchUserInfo = async () => {
        try{
            const userInfo = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/user/`
            )
            setUserInfo(userInfo.data)
        } catch (error) {
        }
    }

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push("/app/account/login");
        } catch (error) {
            
        }
    }

    const getAverageTokenUtilization = () => {
        if (!userInfo) return "--";
        const avgInputTokenUtilization = userInfo.inputTokenUtilization / userInfo.inputTokenLimit;
        const avgOutputTokenUtilization = userInfo.outputTokenUtilization / userInfo.outputTokenLimit;
        return (
            ((avgInputTokenUtilization + avgOutputTokenUtilization) / 2) * 100
        ).toFixed(2);
    }

    const getAverageDataUtilization = () => {
        if (!userInfo) return "--";
        return (
            (userInfo.dataUtilizationMB / userInfo.dataLimitMB) * 100
        ).toFixed(2);
    }

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
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Token: {getAverageTokenUtilization()}% | Data: {getAverageDataUtilization()}%</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
