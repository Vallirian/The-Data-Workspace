"use client";

import { Button } from "@/components/ui/button";

import * as React from "react";
import WorkbooksPage from "./workbooks/page";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import LoginPageWrapper from "./account/(signup-or-login)/login/page";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import { Bot, Calendar, Cat, ChevronRight, Club, Command, Component, Dog, Fan, FerrisWheel, Flower, Frame, Grip, Inbox, InspectionPanel, Loader, MoreHorizontal, Nut, PiggyBank, Plus, Rat, Sailboat, Salad, Search, Settings, ShipWheel, Snail, Sprout, SquareTerminal, Trash2, TreePalm, Trees, Turtle } from "lucide-react";
import ArcAvatar from "@/components/arc-components/navigation/arcAvatar";
import { useEffect, useState } from "react";
import { DataTableMetaInterface, ErrorInterface, WorkbookInterface } from "@/interfaces/main";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import WorkbookByIdPage from "./workbooks/[workbookId]/page";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Home() {
	const router = useRouter();
	const [loading, setLoading] = React.useState(true);
	const [user, setUser] = React.useState<User | null>(null);
	const sidebar = useSidebar();

	const [selectedWorkbook, setSelectedWorkbook] = useState<WorkbookInterface | null>(null);
	const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
	const [activeWorkbook, setActiveWorkbook] = useState<WorkbookInterface | undefined>(undefined);

	const workbookIcons = [Frame, Command, Club, Component, FerrisWheel, Grip, InspectionPanel, Loader, TreePalm, Trees, Turtle, Sprout, Snail, ShipWheel, Salad, Sailboat, Rat, PiggyBank, Nut, Flower, Fan, Dog, Cat, Bot];

	// workbooks
	useEffect(() => {
		// Fetch workbooks and metadata from API once to avoid multiple calls in render
		fetchWorkbooksAndMetadata();
	}, []);

	useEffect(() => {
		if (activeWorkbook) {
			router.push(`/workbooks/${activeWorkbook?.id}`);
		}
	}, [activeWorkbook]);

	const fetchWorkbooksAndMetadata = async () => {
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

	const createWorkbook = async () => {
		try {
			const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/`, {});
			const newWorkbook = await response.data;
			setWorkbooks([...workbooks, newWorkbook]);
			setActiveWorkbook(newWorkbook);
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
		<div>
			<nav className="px-4 py-2 flex bg-zinc-50">
				<SidebarTrigger className="bg-zinc-50"/>
			</nav>
			<div className="flex flex-col gap-5 h-screen w-full items-center  justify-center px-4 bg-zinc-50">
				<div className="bg-gradient-to-r from-purple-600 to-orange-600 text-center text-transparent bg-clip-text ">
					<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-4xl mb-1">
						{(() => {
							const hours = new Date().getHours();
							let greeting;
							if (hours < 12) {
								greeting = "Good morning";
							} else if (hours < 18) {
								greeting = "Good afternoon";
							} else {
								greeting = "Good evening";
							}
							return `${greeting}, ${auth.currentUser?.displayName?.split(" ")[0]}`;
						})()}
					</h1>{" "}
				</div>
				<div className="text-center mb-5">
					<p className="text-md text-muted-foreground">Welcome back to Processly, the zero-data exposure</p>
					<p className="text-md text-muted-foreground">analytics tool powered by AI</p>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="link"
							onClick={() => {
								sidebar.setOpen(true);
							}}
							className="px-0"
						>
							<span>{workbooks.length} active workbooks</span>
						</Button>
						<span className="px-3">|</span>
						<Button
							variant="link"
							onClick={() => {
								createWorkbook();
							}}
							className="px-0"
						>
							+ Create New
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
