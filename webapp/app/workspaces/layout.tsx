"use client";

import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { SidebarGroupContent, SidebarInset, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { Bot, Cat, ChevronRight, Club, Command, Component, Dog, Fan, FerrisWheel, Flower, Frame, Grip, InspectionPanel, Loader, MailQuestion, MoreHorizontal, Nut, PiggyBank, Plus, Rat, Sailboat, Salad, ShipWheel, Snail, Sprout, Trash2, TreePalm, Trees, Turtle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";

let workspaces = [
	{
		name: "Personal Life Management",
		emoji: "🏠",
		pages: [
			{
				name: "Daily Journal & Reflection",
				url: "#",
				emoji: "📔",
			},
			{
				name: "Health & Wellness Tracker",
				url: "#",
				emoji: "🍏",
			},
			{
				name: "Personal Growth & Learning Goals",
				url: "#",
				emoji: "🌟",
			},
		],
	},
	{
		name: "Professional Development",
		emoji: "💼",
		pages: [
			{
				name: "Career Objectives & Milestones",
				url: "#",
				emoji: "🎯",
			},
			{
				name: "Skill Acquisition & Training Log",
				url: "#",
				emoji: "🧠",
			},
			{
				name: "Networking Contacts & Events",
				url: "#",
				emoji: "🤝",
			},
		],
	},
	{
		name: "Creative Projects",
		emoji: "🎨",
		pages: [
			{
				name: "Writing Ideas & Story Outlines",
				url: "#",
				emoji: "✍️",
			},
			{
				name: "Art & Design Portfolio",
				url: "#",
				emoji: "🖼️",
			},
			{
				name: "Music Composition & Practice Log",
				url: "#",
				emoji: "🎵",
			},
		],
	},
	{
		name: "Home Management",
		emoji: "🏡",
		pages: [
			{
				name: "Household Budget & Expense Tracking",
				url: "#",
				emoji: "💰",
			},
			{
				name: "Home Maintenance Schedule & Tasks",
				url: "#",
				emoji: "🔧",
			},
			{
				name: "Family Calendar & Event Planning",
				url: "#",
				emoji: "📅",
			},
		],
	},
	{
		name: "Travel & Adventure",
		emoji: "🧳",
		pages: [
			{
				name: "Trip Planning & Itineraries",
				url: "#",
				emoji: "🗺️",
			},
			{
				name: "Travel Bucket List & Inspiration",
				url: "#",
				emoji: "🌎",
			},
			{
				name: "Travel Journal & Photo Gallery",
				url: "#",
				emoji: "📸",
			},
		],
	},
];

export default function Workspace({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const [selectedWorkbook, setSelectedWorkbook] = useState<WorkbookInterface | null>(null);
	const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
	const [sharedReports, setSharedReports] = useState<SharedReportInterface[]>([]);

	const { user, loading } = useAuth();

	const workbookIcons = [Frame, Command, Club, Component, FerrisWheel, Grip, InspectionPanel, Loader, TreePalm, Trees, Turtle, Sprout, Snail, ShipWheel, Salad, Sailboat];
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
		<>
			<Toaster />
			<SidebarProvider defaultOpen={true} className="h-screen overflow-auto">
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
												<span className="text-xs">Free (Beta)</span>
											</div>
										</div>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Workspaces</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{workspaces.map((workspace) => (
										<Collapsible key={workspace.name}>
											<SidebarMenuItem>
												<SidebarMenuButton asChild>
													<a href="#">
														<span>{workspace.emoji}</span>
														<span>{workspace.name}</span>
													</a>
												</SidebarMenuButton>
												<CollapsibleTrigger asChild>
													<SidebarMenuAction className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90" showOnHover>
														<ChevronRight />
													</SidebarMenuAction>
												</CollapsibleTrigger>
												<SidebarMenuAction showOnHover>
													<Plus />
												</SidebarMenuAction>
												<CollapsibleContent>
													<SidebarMenuSub>
														{workspace.pages.map((page) => (
															<SidebarMenuSubItem key={page.name}>
																<SidebarMenuSubButton asChild>
																	<a href="#">
																		{/* <span>{page.emoji}</span> */}
																		<span>{page.name}</span>
																	</a>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														))}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									))}
									<SidebarMenuItem>
										<SidebarMenuButton className="text-sidebar-foreground/70">
											<MoreHorizontal />
											<span>More</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<Separator className="mx-auto w-[80%]" />
						{/* {sharedReports.length > 0 && (
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
						)} */}
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
		</>
	);
}
