"use client";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/services/axios";
import { SharedReportInterface } from "@/interfaces/main";
import KpiColumn from "../../../workbooks/(report)/kpiColumn";
import TableColumn from "../../../workbooks/(report)/tableColumn";
import { useParams, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import ArcNavbar from "@/app/app/sub-components/navigation/arcNavbar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SharedReport() {
	const { toast } = useToast();
	const router = useRouter();
	const { reportId } = useParams();
	const [report, setReport] = useState<SharedReportInterface | null>(null);
	const [askToSignin, setAskToSignin] = useState(false);

	const visibleColumns = useMemo(() => {
		if (!report) return [];

		return report.rows.map((row) => ({
			...row,
			columns: row.columns.filter((column) => column.formula && column.formula.trim() !== ""),
		}));
	}, [report]);

	useEffect(() => {
		fetchReport();
	}, [reportId]);

	const fetchReport = async () => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/shared/reports/${reportId}/`);
			console.log(response.data);
			const fetchedReport: SharedReportInterface = response.data;
			setReport(fetchedReport);

			// Fetch values for all formulas in the report
			const formulaIds = fetchedReport.rows.flatMap((row) => row.columns.map((col) => col.formula)).filter((id, index, self) => id && self.indexOf(id) === index);
		} catch (error: any) {
			if (error.response?.status === 401) {
				setAskToSignin(true);
				return;
			} else {
				toast({
					variant: "destructive",
					title: "Error fetching report",
					description: error.response?.data?.error || "Failed to load report",
				});
			}
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<ArcNavbar />
			{askToSignin && (
				<AlertDialog defaultOpen={askToSignin}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Login or Signup to view report</AlertDialogTitle>
							<AlertDialogDescription>Please signin or login to view this report.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								onClick={() => {
									router.push("/app/workbooks");
								}}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									router.push("/app/account/login?redirect=" + window.location.pathname);
								}}
							>
								Signin
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<Toaster />
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
