"use client";

import localFont from "next/font/local";
import "./globals.css";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { Bot, Cat, Club, Command, Component, Dog, Fan, FerrisWheel, Flower, Frame, Grip, InspectionPanel, Loader, MailQuestion, MoreHorizontal, Nut, PiggyBank, Plus, Rat, Sailboat, Salad, ShipWheel, Snail, Sprout, Trash2, TreePalm, Trees, Turtle } from "lucide-react";
import ArcAvatar from "@/components/arc-components/navigation/arcAvatar";
import { useEffect, useState } from "react";
import { DataTableMetaInterface, ErrorInterface, WorkbookInterface } from "@/interfaces/main";
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
	const [tableMetas, setTableMetas] = useState<DataTableMetaInterface[]>([]);

	const { user, loading } = useAuth();

	const workbookIcons = [Frame, Command, Club, Component, FerrisWheel, Grip, InspectionPanel, Loader, TreePalm, Trees, Turtle, Sprout, Snail, ShipWheel, Salad, Sailboat, Rat, PiggyBank, Nut, Flower, Fan, Dog, Cat, Bot];

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
			fetchWorkbooksAndMetadata();
		}
	}, [user]);

	const fetchWorkbooksAndMetadata = async () => {
		try {
			// Fetch all workbooks
			const workbooksResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/`);
			const workbooksData = await workbooksResponse.data;
			setWorkbooks(workbooksData);

			// Fetch metadata for each workbook's table
			const tableMetaPromises = workbooksData.map((workbook: WorkbookInterface) => fetchTableMeta(workbook.id, workbook.dataTable));
			const tableMetasData = await Promise.all(tableMetaPromises);
			setTableMetas(tableMetasData);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error getting workbooks",
				description: err.response?.data?.error || "Failed to load workbooks",
			});
		}
	};

	const fetchTableMeta = async (workbookId: string, tableId: string) => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/`);
			return response.data;
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error getting table metadata",
				description: err.response?.data?.error || "Failed to load table metadata",
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
				<title>Processly</title>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Toaster />
				<SidebarProvider defaultOpen={false} className="h-screen overflow-auto">
					<Sidebar collapsible="icon">
						<SidebarHeader>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton size="lg" asChild>
										<a href="/">
											<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
												<Image src="/images/logo-1-white-png.png" alt="Logo" width={18} height={18} className="p-0" />
											</div>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">Processly</span>
												<div className="flex items-center text-xs text-muted-foreground">
													<span className="truncate text-xs">Free</span>
													<span className="truncate text-xs">{" (Beta)"}</span>
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
												tooltip={tableMetas.find((tableMeta) => tableMeta?.id === workbookItem.dataTable)?.name || "Unknown Table"}
												onClick={() => {
													setSelectedWorkbook(workbookItem);
													router.push(`/workbooks/${workbookItem.id}`);
												}}
												isActive={selectedWorkbook?.id === workbookItem.id}
												key={workbookItem.id}
											>
												{React.createElement(workbookIcons[parseInt(workbookItem.id, 36) % workbookIcons.length], { className: "h-5 w-5" })}
												<span>{tableMetas.find((tableMeta) => tableMeta?.id === workbookItem.dataTable)?.name || "Unknown Table"}</span>
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
														<span>{format(workbookItem.createdAt, "PPpp")}</span>
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
							<SidebarGroup>
								<SidebarGroupLabel>Support</SidebarGroupLabel>{" "}
								<SidebarMenu>
									<SidebarMenuItem>
										<a href="https://discord.gg/TsRMXHnF" target="_blank" rel="noopener noreferrer">
											<SidebarMenuButton tooltip="Support" onClick={() => {}}>
												<DiscordLogoIcon className="h-5 w-5" />
												<span>Discord</span>
											</SidebarMenuButton>
										</a>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<a href="mailto:founder@processly.ai" target="_blank" rel="noopener noreferrer">
											<SidebarMenuButton tooltip="founder@processly.ai" onClick={() => {}}>
												<MailQuestion className="h-5 w-5" />
												<span>Email The Founder</span>
											</SidebarMenuButton>
										</a>
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
