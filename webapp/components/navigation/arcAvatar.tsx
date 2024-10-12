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

export default function ArcAvatar() {
    const [user, setUser] = useState<User | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);

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
            console.log(userInfo.data)
            setUserInfo(userInfo.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getAverageTokenUtilization = () => {
        if (!userInfo) return "--";
        const avgInputTokenUtilization = userInfo.inputTokenUtilization / userInfo.inputTokenLimit;
        const avgOutputTokenUtilization = userInfo.outputTokenUtilization / userInfo.outputTokenLimit;
        console.log(avgInputTokenUtilization, avgOutputTokenUtilization)
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
                <DropdownMenuItem>Logout</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Token: {getAverageTokenUtilization()}% | Data: {getAverageDataUtilization()}%</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
