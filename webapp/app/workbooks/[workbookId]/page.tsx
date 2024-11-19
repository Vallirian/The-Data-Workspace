"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadCSV from "../(importData)/uploadCsv";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/axios";
import { ErrorInterface, WorkbookInterface } from "@/interfaces/main";
import ArcDataTable from "../(table)/dataTable";
import Formulas from "../(formula)/formulas";
import Report from "../(report)/report";
import { useToast } from "@/hooks/use-toast";
import { ChartNoAxesColumn, Table2, Upload } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function WorkbookByIdPage() {
	const { toast } = useToast();
	const sidebar = useSidebar();

	const { workbookId } = useParams();
	const [workbook, setWorkbook] = useState<WorkbookInterface | null>(null);

	// Fetch tableId when workbookId is available
	useEffect(() => {
		if (workbookId) {
			fetchWorkbook();
		}
		sidebar.setOpen(false);
	}, [workbookId]);

	const fetchWorkbook = async () => {
		try {
			// Fetch all workbooks
			const workbooksResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`);
			const workbooksData = await workbooksResponse.data;
			setWorkbook(workbooksData);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error to get workbook",
				description: err.response?.data?.error || "Failed to load workbook",
			});
		}
	};

	const updateWorkbook = async (data: Partial<WorkbookInterface>) => {
		try {
			const response = await axiosInstance.patch(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`, data);
			const updatedWorkbook = response.data;
			setWorkbook(updatedWorkbook);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error updating workbook",
				description: err.response?.data?.error || "Failed to update workbook",
			});
		}
	};

	const [activeLeftTab, setActiveLeftTab] = useState("table");

	if (!workbook || !workbookId || !workbook.dataTable) {
		return (
			<div className="flex flex-col justify-between m-auto items-center h-screen bg-background">
				<div>Loading...</div>;
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* having h-screen allows separate scroll areas */}
			<nav className="px-4 py-2 flex justify-between items-center border-b">
				<div className="flex flex-grow items-center justify-between">
					<div className="flex items-center gap-2">
						<SidebarTrigger />
						<input type="text" placeholder="Untitled Workbook" className="border-none focus:outline-none" defaultValue={workbook.name || "Untitled Workbook"} onBlur={(e) => updateWorkbook({ name: e.target.value })} />
					</div>
					<Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="w-auto">
						<TabsList>
							<TabsTrigger value="report">
								<ChartNoAxesColumn className="h-4 w-4 mr-1" />
								Report
							</TabsTrigger>
							<TabsTrigger value="table">
								<Table2 className="h-4 w-4 mr-1" />
								Table
							</TabsTrigger>
							<TabsTrigger value="import">
								<Upload className="h-4 w-4 mr-1" />
								Import
							</TabsTrigger>
						</TabsList>
					</Tabs>
					<div></div>
				</div>
				<div className="w-1/4"></div>
			</nav>
			<div className="flex flex-1 overflow-hidden">
				<div className="w-3/4 h-full flex-grow border-r">
					{activeLeftTab === "report" && <Report workbookId={workbookId as string} reportId={workbook.report} />}
					{activeLeftTab === "table" && <ArcDataTable workbookId={workbookId as string} tableId={workbook.dataTable} />}
					{activeLeftTab === "import" && (
						<div className="p-4">
							<UploadCSV workbookId={workbookId as string} tableId={workbook.dataTable} />
						</div>
					)}
				</div>
				<div className="w-1/4 h-full">
					<Formulas
						workbookId={workbookId as string}
						tableId={workbook.dataTable}
						// trigger refresh when tab is active
					/>
				</div>
			</div>
		</div>
	);
}
