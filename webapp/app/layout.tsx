"use client";

import localFont from "next/font/local";
import "./globals.css";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { Bot, Cat, Club, Command, Component, Dog, Fan, FerrisWheel, Flower, Frame, Grip, InspectionPanel, Linkedin, Loader, MailQuestion, MoreHorizontal, Nut, PiggyBank, Plus, Rat, Sailboat, Salad, ShipWheel, Snail, Sprout, Trash2, TreePalm, Trees, Turtle } from "lucide-react";
import ArcAvatar from "@/components/arc-components/navigation/arcAvatar";
import { useEffect, useState } from "react";
import { ErrorInterface, SharedReportInterface, WorkbookInterface } from "@/interfaces/main";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import useAuth from "@/hooks/useAuth";
import { ToastAction } from "@radix-ui/react-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const [selectedWorkbook, setSelectedWorkbook] = useState<WorkbookInterface | null>(null);
	const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
	const [sharedReports, setSharedReports] = useState<SharedReportInterface[]>([]);

	const { user, loading } = useAuth();

	const workbookIcons = [Frame, Command, Club, Component, FerrisWheel, Grip, InspectionPanel, Loader, TreePalm, Trees, Turtle, Sprout, Snail, ShipWheel, Salad, Sailboat, Linkedin];
	const sharedReportIcons = [Rat, PiggyBank, Nut, Flower, Fan, Dog, Cat, Bot];

	// Redirect to login if user is not authenticated and loading is complete
	useEffect(() => {
		if (!loading && !user) {
			router.push("/account/login");
		}
	}, [user, loading, router]);

	// workbooks
	useEffect(() => {
		if (user) {
			// Fetch workbooks and metadata from API once to avoid multiple calls in render
			fetchWorkbooks();
			fetchSharedReports();
		}
	}, [user]);

	const fetchWorkbooks = async () => {
		try {
			// Fetch all workbooks
			const workbooksResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/`);
			const workbooksData = await workbooksResponse.data;
			setWorkbooks(workbooksData);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error getting workbooks",
				description: err.response?.data?.error || "Failed to load workbooks",
			});
		}
	};

	const fetchSharedReports = async () => {
		try {
			// Fetch all workbooks
			const sharedReportsResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/shared/reports/`);
			const sharedReportsData = await sharedReportsResponse.data;
			setSharedReports(sharedReportsData);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error getting shared reports",
				description: err.response?.data?.error || "Failed to load shared reports",
			});
		}
	};

	const createWorkbook = async () => {
		try {
			const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/`, {});
			const newWorkbook = await response.data;
			setWorkbooks([...workbooks, newWorkbook]);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error creating workbook",
				description: err.response?.data?.error || "Failed to create workbook",
			});
		}
	};

	const confirmDeleteWorkbook = async ({ workbookId }: { workbookId: string }) => {
		toast({
			variant: "default",
			title: "Are you sure?",
			description: "This will permanently delete the workbook and all its data.",
			action: (
				<ToastAction altText="Confirm Delete" onClick={() => handleDeleteWorkbook({ workbookId })}>
					<Button variant="destructive">Delete</Button>
				</ToastAction>
			),
		});
	};

	const handleDeleteWorkbook = async ({ workbookId }: { workbookId: string }) => {
		try {
			// Fetch all workbooks
			await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`);
			setWorkbooks(workbooks.filter((workbook) => workbook.id !== workbookId));
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error deleting workbook",
				description: err.response?.data?.error || "Failed to delete workbook",
			});
		}
	};

	return (
		<html lang="en">
			<head>
				<title>The Data Workspace</title>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Toaster />
				<SidebarProvider defaultOpen={true} className="h-screen overflow-auto bg-white">
					<Sidebar collapsible="icon">
						<SidebarHeader>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton size="lg" asChild>
										<a href="/">
											<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
												{/* <Image src="/images/tds1.png" alt="Logo" width={50} height={50} className="p-0" /> */}
												<p className="font-bold text-2xl text-muted-foreground">T.</p>
											</div>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">The Data Worksapce</span>
												<div className="flex items-center text-xs text-muted-foreground">
													<span className="text-xs">Beta</span>
												</div>
											</div>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarHeader>
						<SidebarContent>
							<SidebarGroup>
								<SidebarGroupLabel>
									Workbooks
									<Plus className="ml-auto" onClick={createWorkbook} />
								</SidebarGroupLabel>{" "}
								<SidebarMenu>
									{workbooks.map((workbookItem) => (
										<SidebarMenuItem key={workbookItem.id}>
											<SidebarMenuButton
												tooltip={workbookItem.name || "Untitled Workbook"}
												onClick={() => {
													setSelectedWorkbook(workbookItem);
													router.push(`/workspaces/${workbookItem.id}`);
												}}
												isActive={selectedWorkbook?.id === workbookItem.id}
												key={workbookItem.id}
											>
												{React.createElement(workbookIcons[parseInt(workbookItem.id, 36) % workbookIcons.length], { className: "h-5 w-5" })}
												<span>{workbookItem.name || "Untitled Workbook"}</span>
											</SidebarMenuButton>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuAction showOnHover>
														<MoreHorizontal />
														<span className="sr-only">More</span>
													</SidebarMenuAction>
												</DropdownMenuTrigger>
												<DropdownMenuContent className="w-48" side={"right"} align={"start"}>
													<DropdownMenuItem>
														<span>{format(workbookItem.createdAt, "PPp")}</span>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => confirmDeleteWorkbook({ workbookId: workbookItem.id })}>
														<Trash2 className="text-muted-foreground h-4 w-4 mr-2" />
														<span>Delete Project</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroup>
							<Separator className="mx-auto w-[80%]" />
							{sharedReports.length > 0 && (
								<>
									<SidebarGroup>
										<SidebarGroupLabel>Shared</SidebarGroupLabel>{" "}
										<SidebarMenu>
											{sharedReports.map((sharedReportItem) => (
												<SidebarMenuItem key={sharedReportItem.id}>
													<SidebarMenuButton
														tooltip={sharedReportItem.name || "Untitled Report"}
														onClick={() => {
															router.push(`/shared/reports/${sharedReportItem.id}`);
														}}
														key={sharedReportItem.id}
													>
														{React.createElement(workbookIcons[parseInt(sharedReportItem.id, 36) % workbookIcons.length], { className: "h-5 w-5" })}
														<span>{sharedReportItem.name || "Untitled Report"}</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroup>
									<Separator className="mx-auto w-[80%]" />
								</>
							)}
							<SidebarGroup>
								<SidebarGroupLabel>Support</SidebarGroupLabel>{" "}
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton tooltip="/in/naol-basaye" onClick={() => {}}>
											<Linkedin className="h-5 w-5" />
											<Link href="https://www.linkedin.com/in/naol-basaye/" target="_" className="text-muted-foreground hover:text-foreground">
												Contact Me
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroup>
						</SidebarContent>
						<SidebarFooter>
							<ArcAvatar />
						</SidebarFooter>
						<SidebarRail />
					</Sidebar>

					<SidebarInset>
						<main>{children}</main>
					</SidebarInset>
				</SidebarProvider>
			</body>
		</html>
	);
}
