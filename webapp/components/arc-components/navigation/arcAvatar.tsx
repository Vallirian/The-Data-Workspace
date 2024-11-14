import { onAuthStateChanged, User } from "firebase/auth"; // Import necessary Firebase auth utilities
import { auth } from "@/services/firebase";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axiosInstance from "@/services/axios";
import { ErrorInterface, UserInfoInterface } from "@/interfaces/main";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { ChevronsUpDown, Database, LogOut, Sparkles } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export default function ArcAvatar() {
	const [user, setUser] = useState<User | null>(null);
	const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);
	const router = useRouter();
	const { toast } = useToast();
	const { isMobile } = useSidebar();

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
		try {
			const userInfo = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/user/`);
			setUserInfo(userInfo.data);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error getting user info",
				description: err.response?.data?.error || "Failed to load user info",
			});
		}
	};

	const handleLogout = async () => {
		try {
			await auth.signOut();
			router.push("/account/login");
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error logging out",
				description: err.response.data.error || "Failed to logout",
			});
		}
	};

	const getAverageTokenUtilization = () => {
		if (!userInfo) return "--";
		const avgInputTokenUtilization = userInfo.inputTokenUtilization / userInfo.inputTokenLimit;
		const avgOutputTokenUtilization = userInfo.outputTokenUtilization / userInfo.outputTokenLimit;
		return (((avgInputTokenUtilization + avgOutputTokenUtilization) / 2) * 100).toFixed(2);
	};

	const getAverageDataUtilization = () => {
		if (!userInfo) return "--";
		return ((userInfo.dataUtilizationMB / userInfo.dataLimitMB) * 100).toFixed(2);
	};

	return (
		<SidebarMenu className="px-0">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage alt={user?.displayName || "User"} />
								<AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : "U"}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user?.displayName || "User"}</span>
								<span className="truncate text-xs">{user?.email || "Email"}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="cursor-pointer">
									<AvatarImage alt={user?.displayName || "User"} />
									<AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : "U"}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user?.displayName || "User"}</span>
									<span className="truncate text-xs">{user?.email || "Email"}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className="h-4 w-4 mr-2" />
							Log out
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles className="h-4 w-4 mr-2" />
								Token: {getAverageTokenUtilization()}% 
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Database className="h-4 w-4 mr-2" />
								Data: {getAverageDataUtilization()}%
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
