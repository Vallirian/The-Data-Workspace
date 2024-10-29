"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import axiosInstance from "@/services/axios";
import { DataTableMetaInterface, ErrorInterface, WorkbookInterface } from "@/interfaces/main";
import { format } from "date-fns";
import ArcNavbar from "../sub-components/navigation/arcNavbar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function WorkbooksPage() {
	const { toast } = useToast();

	const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
	const [tableMetas, setTableMetas] = useState<DataTableMetaInterface[]>([]);
	const router = useRouter();

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
		<div className="min-h-screen bg-background flex flex-col">
			<ArcNavbar />
			<Toaster />

			<main className="flex-grow p-6 overflow-auto">
				<div className="my-5">
					<h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Workbooks</h2>
					<p className="text-sm text-muted-foreground">
						<span className="text-blue-600">{workbooks.length} workbook{workbooks.length === 1 ? "" : "s"}</span> | Create new or Open existing
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
					<Card className="flex flex-col items-center justify-center cursor-pointer hover:bg-accent" onClick={createWorkbook}>
						<CardContent className="flex flex-col justify-center items-center">
							<Plus className="h-6 w-6 mb-2" />
							<p className="text-sm font-medium"> Add Workbook</p>
						</CardContent>
					</Card>
					{workbooks.map((workbook) => (
						<Card
                            key={workbook.id}
							className="flex flex-col cursor-pointer hover:bg-accent"
							onClick={() => {
								router.push(`/app/workbooks/${workbook.id}`);
							}}
						>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{tableMetas.find((tableMeta) => tableMeta?.id === workbook.dataTable)?.name || "Unknown Table"}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-muted-foreground">{tableMetas.find((tableMeta) => tableMeta?.id === workbook.dataTable)?.description || "No description"}</p>
							</CardContent>
							<CardFooter className="mt-auto">
								<p className="text-xs text-muted-foreground">{format(workbook.createdAt, "PPP")}</p>
							</CardFooter>
						</Card>
					))}
				</div>
			</main>
		</div>
	);
}
