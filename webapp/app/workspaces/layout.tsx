"use client";

import { SidebarGroupContent, SidebarInset, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Bot, Cat, ChevronRight, Club, Command, Component, Database, Dog, Fan, FerrisWheel, Flower, Frame, Grip, InspectionPanel, Layers, Loader, MailQuestion, MoreHorizontal, Nut, PiggyBank, Plus, Rat, Sailboat, Salad, ShipWheel, Snail, Sprout, Trash2, TreePalm, Trees, Turtle } from "lucide-react";
import ArcAvatar from "@/components/arc-components/navigation/arcAvatar";
import { Fragment, useEffect, useState } from "react";
import { ErrorInterface, SharedReportInterface, WorkbookInterface } from "@/interfaces/main";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import useAuth from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { WorkspaceInterface } from "@/interfaces/main";

export default function Workspace({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const { user, loading } = useAuth();

	// Redirect to login if user is not authenticated and loading is complete
	useEffect(() => {
		if (!loading && !user) {
			router.push("/account/login");
		}
	}, [user, loading, router]);

	// State for workspaces
	const [workspacesList, setWorkspacesList] = useState<WorkspaceInterface[]>([]);

	// workspaces
	useEffect(() => {
		const fetchWorkspaces = async () => {
			if (!user) return;
			try {
				const response = await axiosInstance.get<WorkspaceInterface[]>(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/`);
				setWorkspacesList(response.data);
			} catch (error: unknown) {
				const err = error as ErrorInterface;
				toast({
					variant: "destructive",
					title: "Error fetching workspaces",
					description: err.response?.data?.error || "Failed to load workspaces",
				});
			}
		};

		fetchWorkspaces();
	}, [user]);

	const createWorkspace = async () => {
		try {
			const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/`, {});
			const newWorkspace = await response.data;
			setWorkspacesList([...workspacesList, newWorkspace]);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error creating workspace",
				description: err.response?.data?.error || "Failed to create workspace",
			});
		}
	};

	// const confirmDeleteWorkbook = async ({ workbookId }: { workbookId: string }) => {
	// 	toast({
	// 		variant: "default",
	// 		title: "Are you sure?",
	// 		description: "This will permanently delete the workbook and all its data.",
	// 		action: (
	// 			<ToastAction altText="Confirm Delete" onClick={() => handleDeleteWorkbook({ workbookId })}>
	// 				<Button variant="destructive">Delete</Button>
	// 			</ToastAction>
	// 		),
	// 	});
	// };

	// const handleDeleteWorkbook = async ({ workbookId }: { workbookId: string }) => {
	// 	try {
	// 		// Fetch all workbooks
	// 		await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`);
	// 		setWorkbooks(workbooks.filter((workbook) => workbook.id !== workbookId));
	// 	} catch (error: unknown) {
	// 		const err = error as ErrorInterface;
	// 		toast({
	// 			variant: "destructive",
	// 			title: "Error deleting workbook",
	// 			description: err.response?.data?.error || "Failed to delete workbook",
	// 		});
	// 	}
	// };

	const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; path: string }[]>([]);

	const pathname = usePathname();
	useEffect(() => {
		const pathSegments = pathname.split("/").filter(Boolean);

		const newCrumbs = pathSegments.map((segment, i) => {
			let label = segment;
			let path = "/" + pathSegments.slice(0, i + 1).join("/");

			if (i > 0 && pathSegments[i - 1] === "workspaces") {
				const workspace = workspacesList.find((ws) => ws.id === pathSegments[i]);
				if (workspace) {
					label = workspace.name;
					if (workspace.analysis && workspace.analysis.length > 0) {
						path = `/workspaces/${workspace.id}/analysis/${workspace.analysis[0]}`; // TODO: Fix this
					} else {
						path = `/workspaces/${workspace.id}/data`;
					}
				} else {
					label = "Workspace";
				}
			} else {
				label = segment.replace("data", "Data").replace("workspace", "Workspace");
			}

			return { label, path };
		});

		setBreadcrumbs(newCrumbs);
	}, [pathname, workspacesList]);

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
							<SidebarGroupLabel className="flex items-center justify-between">
								Workspaces
								<SidebarMenuItem>
									<SidebarMenuButton
										onClick={() => {
											createWorkspace();
										}}
									>
										<Plus />
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{workspacesList.map((workspace) => (
										<Collapsible key={workspace.id}>
											<SidebarMenuItem>
												<SidebarMenuButton asChild>
													<a href="#">
														<Layers />
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
														<SidebarMenuSubButton onClick={() => router.push(`/workspaces/${workspace.id}/data`)}>
															<Database />
															Data
														</SidebarMenuSubButton>
														{/* {workspace.analysis &&
															workspace.analysis.map((analysis) => (
																// <SidebarMenuSubItem key={page.name}>
																// 	<SidebarMenuSubButton asChild>
																// 		<a href="#">
																// 			<span>{page.name}</span>
																// 		</a>
																// 	</SidebarMenuSubButton>
																// </SidebarMenuSubItem>
																// <div>{"analysis"}</div>
															))} */}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
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
					<header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbs.map((crumb, i) => (
									<Fragment key={i}>
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
										</BreadcrumbItem>
										{i < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
									</Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</header>
					<main>{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
