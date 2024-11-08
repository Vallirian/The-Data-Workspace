"use client";

import * as React from "react";
import WorkbooksPage from "./workbooks/page";
import { useRouter } from "next/navigation";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import LoginPageWrapper from "./account/(signup-or-login)/login/page";
import { AppSidebar } from "@/components/arc-components/sidebar/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [loading, setLoading] = React.useState(true);
	const [user, setUser] = React.useState<User | null>(null);

	// React.useEffect(() => {
	// 	// Listen for authentication state changes
	// 	const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
	// 		if (currentUser) {
	// 			// User is signed in
	// 			setUser(currentUser);

	// 			// Redirect to Workbooks page if logged in
	// 			router.push("/workbooks");
	// 		} else {
	// 			// No user is signed in
	// 			setUser(null);
	// 			// Redirect to login page if not logged in
	// 			router.push("/account/login");
	// 		}
	// 		setLoading(false);
	// 	});

	// 	// Clean up the subscription on unmount
	// 	return () => unsubscribe();
	// }, [router]);

	// if (loading) {
	// 	// Optionally render a loading state
	// 	return <div>Loading...</div>;
	// }

	// Optionally render the WorkbooksPage if we choose not to use redirects
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					{children}
				</header>
			</SidebarInset>
		</SidebarProvider>
	);
}
