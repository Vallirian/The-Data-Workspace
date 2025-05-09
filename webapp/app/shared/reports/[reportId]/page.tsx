"use client";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/services/axios";
import { ErrorInterface, SharedReportInterface } from "@/interfaces/main";
import KpiColumn from "@/app/workbooks/(report)/kpiColumn";
import TableColumn from "@/app/workbooks/(report)/tableColumn";
import { useParams } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function SharedReport() {
	const { toast } = useToast();
	const sidebar = useSidebar();
	const { reportId } = useParams();
	const [report, setReport] = useState<SharedReportInterface | null>(null);

	const visibleColumns = useMemo(() => {
		if (!report) return [];

		return report.rows.map((row) => ({
			...row,
			columns: row.columns.filter((column) => column.formula && column.formula.trim() !== ""),
		}));
	}, [report]);

	useEffect(() => {
		sidebar.setOpen(false);
	}, []);

	useEffect(() => {
		const fetchReport = async () => {
			try {
				const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/shared/reports/${reportId}/`);
				const fetchedReport: SharedReportInterface = response.data;
				setReport(fetchedReport);
			} catch (error: unknown) {
				const err = error as ErrorInterface;
				if (err.response?.status === 401) {
					return; // the useAuth hook in ~/layout.tsx will redirect to login
				}
				toast({
					variant: "destructive",
					title: "Error fetching report",
					description: err.response?.data?.error || "Failed to load report",
				});
			}
		};

		fetchReport();
	}, [reportId]);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center px-4 my-4 gap-2">
					<SidebarTrigger/>
					<p>{report?.name || "Untitled Report"}</p>
				</div>
				<div className="flex-grow overflow-y-auto p-4 space-y-4">
					{visibleColumns?.map((row, rowIndex) => (
						<div key={rowIndex} className={`flex ${row.rowType !== "kpi" ? "flex-col sm:flex-row" : ""} space-x-4`}>
							{row.columns.map((column, columnIndex) => (
								<div
									key={`${rowIndex}-${columnIndex}`}
									className={`
										${row.rowType === "kpi" ? (row.columns.length > 1 ? `w-1/${row.columns.length}` : "w-full h-36") : `w-full ${row.columns.length > 1 ? "sm:w-1/2" : ""} h-84`}
										${row.rowType !== "kpi" ? "mb-4 sm:mb-0" : ""}
										rounded-md w-full px-1
									`}
								>
									<ContextMenu>
										<ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md text-sm border">
											{row.rowType === "kpi" && <KpiColumn column={column} formulaValues={report?.formulaValues || []} formulas={report?.formulas || []} />}
											{row.rowType === "table" && <TableColumn column={column} formulaValues={report?.formulaValues || []} formulas={report?.formulas || []} />}
										</ContextMenuTrigger>
									</ContextMenu>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
