"use client";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface, ReportInterface } from "@/interfaces/main";
import KpiColumn from "../../workbooks/(report)/kpiColumn";
import TableColumn from "../../workbooks/(report)/tableColumn";

export default function Report({ workbookId, reportId }: { workbookId: string; reportId: string }) {
	const { toast } = useToast();
	const [report, setReport] = useState<ReportInterface | null>(null);
	const [formulaValues, setFormulaValues] = useState<{
		[key: string]: any;
	}>({});
	const [formulas, setFormulas] = useState<FormulaInterface[]>([]);

	const visibleColumns = useMemo(() => {
		if (!report) return [];

		return report.rows.map((row) => ({
			...row,
			columns: row.columns.filter((column) => column.formula && column.formula.trim() !== ""),
		}));
	}, [report]);

	useEffect(() => {
		fetchReport();
		fetchFormulas();
	}, [reportId]);

	const fetchReport = async () => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/reports/${reportId}/`);
			const fetchedReport: ReportInterface = response.data;
			setReport(fetchedReport);

			// Fetch values for all formulas in the report
			const formulaIds = fetchedReport.rows.flatMap((row) => row.columns.map((col) => col.formula)).filter((id, index, self) => id && self.indexOf(id) === index);

			await Promise.all(formulaIds.map((id) => fetchFormulaValue(id)));
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error fetching report",
				description: error.response?.data?.error || "Failed to load report",
			});
		}
	};

	const fetchFormulas = async () => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`);
			setFormulas(response.data);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error fetching formulas",
				description: error.response?.data?.error || "Failed to load formulas",
			});
		}
	};

	const fetchFormulaValue = async (formulaId: string) => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/value/`);
			setFormulaValues((prev) => ({
				...prev,
				[formulaId]: response.data,
			}));
			console.log(response.data);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error fetching formula value",
				description: error.response.data.error,
			});
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
			<div className="flex justify-between items-center p-4"></div>
			<div className="flex justify-between items-center px-4">
				<h2 className="text-2xl font-bold mb-4">Report</h2>
			</div>
			<div className="flex-grow overflow-y-auto p-4 space-y-4">
				{visibleColumns?.map((row, rowIndex) => (
					<div key={rowIndex} className={`flex ${row.rowType !== "kpi" ? "flex-col sm:flex-row" : ""} space-x-4`}>
						{row.columns.map((column, columnIndex) => (
							<div
								key={`${rowIndex}-${columnIndex}`}
								className={`
                  ${row.rowType === "kpi" ? `w-1/${row.columns.length} h-36` : `w-full ${row.columns.length > 1 ? "sm:w-1/2" : ""} h-84`}
                  ${row.rowType !== "kpi" ? "mb-4 sm:mb-0" : ""}
                  border rounded-md
                `}
							>
								<ContextMenu>
									<ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md border border-dashed text-sm">
										{row.rowType === "kpi" && <KpiColumn column={column} formulaValues={formulaValues} formulas={formulas} />}
										{row.rowType === "table" && <TableColumn column={column} formulaValues={formulaValues} formulas={formulas} />}
									</ContextMenuTrigger>
								</ContextMenu>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
