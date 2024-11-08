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
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { Calendar, Command, Frame, Inbox, MoreHorizontal, Search, Settings, Trash2 } from "lucide-react";
import ArcAvatar from "@/components/arc-components/navigation/arcAvatar";
import { useEffect, useState } from "react";
import { DataTableMetaInterface, ErrorInterface, WorkbookInterface } from "@/interfaces/main";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";

export default function Home({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [loading, setLoading] = React.useState(true);
	const [user, setUser] = React.useState<User | null>(null);

	const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
	const [tableMetas, setTableMetas] = useState<DataTableMetaInterface[]>([]);
	// const router = useRouter();

	useEffect(() => {
		// Fetch workbooks and metadata from API once to avoid multiple calls in render
		fetchWorkbooksAndMetadata();
	}, []);

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

	return (
		<SidebarProvider>
			<Sidebar variant="inset">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<a href="#">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<Image src="/images/logo-1-white-png.png" alt="Logo" width={18} height={18} className="p-0" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">Processly</span>
										<span className="truncate text-xs">Free</span>
									</div>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="group-data-[collapsible=icon]:hidden">
						<SidebarGroupLabel>Projects</SidebarGroupLabel>
						<SidebarMenu>
							{workbooks.map((workbookItem) => (
								<SidebarMenuItem key={workbookItem.id}>
									<SidebarMenuButton asChild>
										<a href={`/workbooks/${workbookItem.id}`}>
											<Frame />
											<span>{tableMetas.find((tableMeta) => tableMeta?.id === workbookItem.dataTable)?.name || "Unknown Table"}</span>
										</a>
									</SidebarMenuButton>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction showOnHover>
												<MoreHorizontal />
												<span className="sr-only">More</span>
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-48" side={"right"} align={"start"}>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<Trash2 className="text-muted-foreground" />
												<span>Delete Project</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<ArcAvatar />
				</SidebarFooter>
			</Sidebar>
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
