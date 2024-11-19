"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/services/axios";
import { ErrorInterface, FormulaInterface, ReportInterface } from "@/interfaces/main";
import KpiColumn from "./kpiColumn";
import TableColumn from "./tableColumn";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";

export default function Report({ workbookId, reportId }: { workbookId: string; reportId: string }) {
	const { toast } = useToast();
	const [report, setReport] = useState<ReportInterface | null>(null);
	const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
	const [formulaValues, setFormulaValues] = useState<{
		[key: string]: any;
	}>({});
	const [editMode, setEditMode] = useState(true);

	const visibleColumns = useMemo(() => {
		if (!report || editMode) return report?.rows;

		return report.rows.map((row) => ({
			...row,
			columns: row.columns.filter((column) => column.formula && column.formula.trim() !== ""),
		}));
	}, [report, editMode]);

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
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error fetching report",
				description: err.response?.data?.error || "Failed to load report",
			});
		}
	};

	const fetchFormulas = async () => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`);
			setFormulas(response.data);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error fetching formulas",
				description: err.response?.data?.error || "Failed to load formulas",
			});
		}
	};

	const saveReport = async () => {
		try {
			if (!report) return;

			// clear empty cells before saving manually because clearemptycells does not do them asynchrounously
			const cleanRows = report.rows.map((row) => ({
				...row,
				columns: row.columns.filter((column) => column.formula != null && column.formula.trim() !== ""),
			}));

			const filteredRows = cleanRows.filter((row) => row.columns.length > 0);
			const updatedReport = { ...report, rows: filteredRows };

			await axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/reports/${reportId}/`, updatedReport);

			// clear empty cells so that the UI is updated
			clearEmtyCells();

			toast({
				title: "Report saved",
				description: "Your report has been saved successfully",
			});
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error saving report",
				description: err.response?.data?.error || "Failed to save report",
			});
		}
	};

	const updateColumn = (rowIndex: number, columnIndex: number, updates: Partial<ReportInterface["rows"][number]["columns"][number]>) => {
		if (!report) return;

		const updatedRows = [...report.rows];
		updatedRows[rowIndex].columns[columnIndex] = {
			...updatedRows[rowIndex].columns[columnIndex],
			...updates,
		};
		setReport({ ...report, rows: updatedRows });

		if (updates.formula) {
			fetchFormulaValue(updates.formula);
		}
	};

	const removeColumn = (rowIndex: number, columnIndex: number) => {
		if (!report) return;

		const updatedRows = [...report.rows];
		updatedRows[rowIndex].columns.splice(columnIndex, 1);
		setReport({ ...report, rows: updatedRows });
	};

	const clearColumn = (rowIndex: number, columnIndex: number) => {
		if (!report) return;

		updateColumn(rowIndex, columnIndex, {
			config: { chartType: null, x: null },
			formula: "",
		});
	};

	const fetchFormulaValue = async (formulaId: string) => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/value/`);
			setFormulaValues((prev) => ({
				...prev,
				[formulaId]: response.data,
			}));
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error fetching formula value",
				description: err.response.data.error,
			});
		}
	};

	const addNewRow = (type: "kpi" | "table") => {
		if (!report) return;
		const newRow = {
			rowType: type,
			columns: [{ config: { chartType: null, x: null }, formula: "" }],
		};
		setReport({
			...report,
			rows: [...report.rows, newRow],
		});
	};

	const addNewColumn = (rowIndex: number) => {
		if (!report) return;

		const row = report.rows[rowIndex];
		const maxSlots = row.rowType === "kpi" ? 4 : 2;

		if (row.columns.length >= maxSlots) return;

		const updatedRows = [...report.rows];
		updatedRows[rowIndex].columns.push({
			config: { chartType: null, x: null },
			formula: "",
		});
		setReport({ ...report, rows: updatedRows });
	};

	const clearEmtyCells = () => {
		if (!report) return;

		const cleanRows = report.rows.map((row) => ({
			...row,
			columns: row.columns.filter((column) => column.formula != null && column.formula.trim() !== ""),
		}));

		const filteredRows = cleanRows.filter((row) => row.columns.length > 0);

		setReport((prevReport) => (prevReport ? { ...prevReport, rows: filteredRows } : prevReport));
	};

	const addSharedViewer = () => {
		const prevSharedWith = report?.sharedWith || [];
		setReport(report ? { ...report, sharedWith: [...prevSharedWith, ""] } : report);
	};

	const updateSharedViewer = (index: number, email: string) => {
		if (!report) return;

		const updatedSharedWith = [...report.sharedWith];
		updatedSharedWith[index] = email;
		setReport({ ...report, sharedWith: updatedSharedWith });
	};

	const patchReport = async (patchedData: Partial<ReportInterface>) => {
		try {
			await axiosInstance.patch(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/reports/${reportId}/`, patchedData);
			toast({
				title: "Report shared",
				description: "Your report has been shared successfully",
				duration: 3000,
			});
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error sharing report",
				description: err.response?.data?.error || "Failed to share report",
			});
		}
	};

	return (
		<div className="flex w-full flex-col h-full overflow-hidden ">
			<Toaster />
			<div className="flex justify-between items-center p-4 mb-4">
				<div className="flex flex-grow items-center px-4">
					{!editMode && <h2 className="text-2xl font-bold">{report?.name || "Untitled Report"}</h2>}
					{editMode && <input 
					placeholder="Untitled Report" 
					className="text-2xl font-bold focus:outline-none w-full" defaultValue={report?.name} onBlur={(e) => setReport(report ? { ...report, name: e.target.value } : report)} />}
				</div>
				<div className="flex items-center">
					<div className="flex items-center space-x-2">
						<Switch id="edit-mode" onCheckedChange={setEditMode} checked={editMode} />
						<Label htmlFor="edit-mode">Edit Mode</Label>
					</div>
					{editMode && (
						<>
							<Button variant="link" onClick={saveReport}>
								Save
							</Button>
							<Button variant="link" onClick={clearEmtyCells}>
								Clear Empty Cells
							</Button>
						</>
					)}

					<Dialog>
						<DialogTrigger asChild>
							<Button variant="link" onClick={clearEmtyCells}>
								Share
							</Button>
						</DialogTrigger>
						<DialogContent className="md:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Share Report</DialogTitle>
								<DialogDescription>
									<p>Add or remove emails for users to view this report</p>
								</DialogDescription>
							</DialogHeader>
							<ScrollArea className="h-72">
								<div className="grid gap-4 py-4">
									{report?.sharedWith.map((email, index) => (
										<div key={email} className="flex items-center gap-4">
											<Input id={`email-${index}`} placeholder="alan@turing.com" className="mx-1" onBlur={(e) => updateSharedViewer(index, e.target.value)} defaultValue={email} />
										</div>
									))}
								</div>
							</ScrollArea>
							<Button variant="link" onClick={addSharedViewer}>
								+ Add Person
							</Button>
							<DialogFooter>
								<div className="flex flex-col">
									<Button type="submit" onClick={() => patchReport({ sharedWith: report?.sharedWith })}>
										Save changes
									</Button>
									<div className="text-center mt-2">
										<p className="my-3 text-muted-foreground">Share this report URL</p>
										<p className="text-foreground">{<a href={`${window.location.origin}/shared/reports/${reportId}`}>{`${window.location.origin}/shared/reports/${reportId}`}</a>}</p>
									</div>
								</div>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="flex-grow overflow-y-auto p-4 space-y-4 w-full">
				{visibleColumns?.map((row, rowIndex) => (
					<div key={rowIndex} className={`flex ${row.rowType !== "kpi" && !editMode ? "flex-col sm:flex-row" : ""} w-full`}>
						{row.columns.map((column, columnIndex) => (
							<div
								key={`${rowIndex}-${columnIndex}`}
								className={`
									${row.rowType === "kpi" ? (row.columns.length > 1 ? `w-1/${row.columns.length}` : "w-full h-36") : `w-full ${row.columns.length > 1 ? "sm:w-1/2" : ""} h-84`}   
									${!editMode && row.rowType !== "kpi" ? "mb-4 sm:mb-0" : ""}
									rounded-md w-full px-1
                				`}
							>
								<ContextMenu>
									<ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md text-sm border">
										{row.rowType === "kpi" && <KpiColumn column={column} formulaValues={formulaValues} formulas={formulas} />}
										{row.rowType === "table" && <TableColumn column={column} formulaValues={formulaValues} formulas={formulas} />}
									</ContextMenuTrigger>
									{editMode && (
										<ContextMenuContent className="w-64">
											{row.rowType === "table" && (
												<ContextMenuSub>
													<ContextMenuSubTrigger inset>Select Chart Type</ContextMenuSubTrigger>
													<ContextMenuSubContent className="w-48">
														{["bar-chart", "line-chart", "table"].map((chartType) => (
															<ContextMenuItem
																key={chartType}
																onClick={() =>
																	updateColumn(rowIndex, columnIndex, {
																		config: {
																			...column.config,
																			chartType: chartType as any,
																		},
																	})
																}
															>
																{chartType.replace("-", " ")}
															</ContextMenuItem>
														))}
													</ContextMenuSubContent>
												</ContextMenuSub>
											)}

											<ContextMenuSub>
												<ContextMenuSubTrigger inset>Select Formula</ContextMenuSubTrigger>
												<ContextMenuSubContent className="w-48">
													{formulas
														.filter((formula) => formula.fromulaType === (row.rowType === "kpi" ? "kpi" : "table"))
														.map((formula) => (
															<ContextMenuItem
																key={formula.id}
																onClick={() => {
																	updateColumn(rowIndex, columnIndex, {
																		formula: formula.id,
																	});
																	fetchFormulaValue(formula.id);
																}}
															>
																{formula.name}
															</ContextMenuItem>
														))}
												</ContextMenuSubContent>
											</ContextMenuSub>
											{row.rowType === "table" &&
												row.columns[columnIndex].formula &&
												Object.keys(formulaValues).includes(row.columns[columnIndex].formula) && ( // because the formula might not have been fetched yet and this will cause an error
													<ContextMenuSub>
														<ContextMenuSubTrigger inset>Select X-Axis</ContextMenuSubTrigger>
														<ContextMenuSubContent className="w-48">
															{Object.keys(formulaValues[row.columns[columnIndex].formula][0] || {}).map((key) => (
																<ContextMenuItem
																	key={key}
																	onClick={() =>
																		updateColumn(rowIndex, columnIndex, {
																			config: {
																				...column.config,
																				x: key,
																			},
																		})
																	}
																>
																	{key}
																</ContextMenuItem>
															))}
														</ContextMenuSubContent>
													</ContextMenuSub>
												)}

											<ContextMenuItem inset onClick={() => removeColumn(rowIndex, columnIndex)}>
												Remove Column
											</ContextMenuItem>
											<ContextMenuItem inset onClick={() => clearColumn(rowIndex, columnIndex)}>
												Clear Column
											</ContextMenuItem>
										</ContextMenuContent>
									)}
								</ContextMenu>
							</div>
						))}
						{editMode && ((row.rowType === "kpi" && row.columns.length < 4) || (row.rowType === "table" && row.columns.length < 2)) && (
							<Button variant="outline" size="icon" className="w-8 h-84" onClick={() => addNewColumn(rowIndex)}>
								<Plus className="h-6 w-4" />
								<span className="sr-only">Add Column</span>
							</Button>
						)}
					</div>
				))}
				{editMode && (
					<div className="py-4 flex justify-center mb-2">
						<Button variant="link" onClick={() => addNewRow("kpi")}>
							+ Add KPI
						</Button>
						<Button variant="link" onClick={() => addNewRow("table")}>
							+ Add Table/Chart
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
