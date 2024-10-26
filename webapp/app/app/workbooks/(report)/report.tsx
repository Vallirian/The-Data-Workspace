"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface, ReportInterface } from "@/interfaces/main";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Plus } from "lucide-react";
import { ArcAutoFormat } from "@/services/autoFormat";

export default function Report({
    workbookId,
    reportId,
}: {
    workbookId: string;
    reportId: string;
}) {
    const { toast } = useToast();
    const [report, setReport] = useState<ReportInterface | null>(null);
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const [formulaValues, setFormulaValues] = useState<{
        [key: string]: string;
    }>({});
    const [editMode, setEditMode] = useState(true);

    // Report
    useEffect(() => {
        fetchReport();
        fetchFormulas();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/reports/${reportId}/`
            );
            const fetchedReport: ReportInterface = response.data;
            setReport(fetchedReport);

            // Check for any pre-selected formulas and fetch their values
            const formulaIds: string[] = [];
            fetchedReport.rows.forEach((row) => {
                row.columns.forEach((col) => {
                    if (col && !formulaIds.includes(col) && col !== "") {
                        formulaIds.push(col); // Assuming `col` contains the formula ID
                    }
                });
            });

            // Fetch all pre-selected formula values
            await Promise.all(formulaIds.map((id) => fetchFormulaValue(id)));
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching report",
                description:
                    error.response?.data?.error || "Failed to load report",
            });
        }
    };

    const fetchFormulas = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`
            );
            const fetchedFormulas: FormulaInterface[] = response.data;
            console.log(fetchedFormulas);
            setFormulas(fetchedFormulas);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching formulas",
                description:
                    error.response?.data?.error || "Failed to load formulas",
            });
        }
    };

    const saveReport = async () => {
        try {
            await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/reports/${reportId}/`,
                report
            );
            toast({
                title: "Report saved",
                description: "Your report has been saved successfully",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error saving report",
                description:
                    error.response?.data?.error || "Failed to save report",
            });
        }
    };

    const setFormula = (
        rowIndex: number,
        columnIndex: number,
        formulaId: string
    ) => {
        if (!report) return;

        const row = report.rows[rowIndex];
        const updatedRow = {
            ...row,
            columns: row.columns.map((col, index) =>
                index === columnIndex ? formulaId : col
            ),
        };
        const updatedRows = [...report.rows];
        updatedRows[rowIndex] = updatedRow;
        setReport({
            ...report,
            rows: updatedRows,
        });

        fetchFormulaValue(formulaId);
    };

    const updateRowConfig = (
        rowIndex: number,
        config: {
            chartType:
                | "bar-chart"
                | "line-chart"
                | "pie-chart"
                | "table"
                | null;
            x: string | null;
        }
    ) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            config: {
                ...updatedRows[rowIndex].config,
                ...config,
            },
        };
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const removeColumn = (rowIndex: number, columnIndex: number) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex].columns.splice(columnIndex, 1);
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const clearFormula = (rowIndex: number, columnIndex: number) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex].columns[columnIndex] = "";
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const fetchFormulaValue = async (formulaId: string) => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/value/`
            );
            console.log(response.data);
            setFormulaValues((prev) => ({
                ...prev,
                [formulaId]: response.data,
            }));
            console.log(formulaValues);
            console.log(report?.rows);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching formula value",
                description: error.response.data.error,
            });
        }
    };

    // Layout
    const addNewRow = (type: "kpi" | "table") => {
        if (!report) return;
        const newRow = {
            rowType: type,
            columns:
                type === "kpi" ? new Array(1).fill("") : new Array(1).fill(""), // Four slots for KPIs, two for tables
            config: { chartType: null, x: null },
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

        // Ensure values is an array
        if (!Array.isArray(row.columns)) {
            row.columns = []; // Reset to empty array if not
        }

        if (row.columns.length >= maxSlots) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex] = {
            ...row,
            columns: [...row.columns, ""],
        };
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    // const clearEmptyCells = () => {
    //     if (!report) return;
    //     console.log(report);

    //     // Remove empty columns (columns that are "")
    //     const cleanedRows = report.rows.map((row) =>
    //         // Filter out empty columns including ones with already deleted formulas
    //         row.columns.filter((col) => col !== "")
    //     );

    //     // Remove empty rows (rows that have columns with length 0)
    //     const filteredRows = cleanedRows.filter((row) => row.length > 0);

    //     setReport({
    //         ...report,
    //         rows: filteredRows.map((row) => ({
    //             ...row,
    //             columns: row,

    //         })),
    //     });
    // };

    const chartData = [
        { month: "January", desktop: 186, mobile: 80 },
        { month: "February", desktop: 305, mobile: 200 },
        { month: "March", desktop: 237, mobile: 120 },
        { month: "April", desktop: 73, mobile: 190 },
        { month: "May", desktop: 209, mobile: 130 },
        { month: "June", desktop: 214, mobile: 140 },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* <ArcStackedBarChart data={chartData} x="month" name="name" description="descr"/> */}
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="edit-mode"
                        onCheckedChange={setEditMode}
                        checked={editMode}
                    />
                    <Label htmlFor="edit-mode">Edit Mode</Label>
                </div>
                <div className="px-4 flex justify-between items-center">
                    {editMode && (
                        <div>
                            <Button
                                variant="link"
                                className="px-3"
                                onClick={saveReport}
                            >
                                Save
                            </Button>
                            <Button
                                variant="link"
                                className="px-3"
                                // onClick={clearEmptyCells}
                            >
                                Clear Empty Cells
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl items-center font-bold mb-4">Report</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {report?.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-4">
                        {row.columns.map((column, columnIndex) => (
                            <div
                                key={`${rowIndex}${columnIndex}`}
                                className={`${
                                    editMode
                                        ? row.rowType === "kpi"
                                            ? "w-1/4 h-36"
                                            : "w-1/2 h-84"
                                        : "w-full"
                                } border rounded-md`}
                            >
                                {row.rowType === "kpi" && (
                                    <ContextMenu>
                                        <ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md border border-dashed text-sm">
                                            {formulas.find(
                                                (f) => f.id === column
                                            ) ? (
                                                <>
                                                    <h5 className="mb-2 font-semibold">
                                                        {
                                                            formulas.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    column
                                                            )?.name
                                                        }
                                                    </h5>
                                                    <p className="mb-2 line-clamp-2">
                                                        {
                                                            formulas.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    column
                                                            )?.description
                                                        }
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="mb-2">
                                                    No Formula Selected
                                                </p>
                                            )}
                                            {formulaValues[column] ? (
                                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                                    {ArcAutoFormat(
                                                        formulaValues[column]
                                                    )}
                                                </h3>
                                            ) : (
                                                "Right click to select a formula"
                                            )}
                                        </ContextMenuTrigger>

                                        <ContextMenuContent className="w-64">
                                            <ContextMenuItem
                                                inset
                                                onClick={() =>
                                                    removeColumn(
                                                        rowIndex,
                                                        columnIndex
                                                    )
                                                }
                                            >
                                                Remove Column
                                            </ContextMenuItem>
                                            <ContextMenuItem
                                                inset
                                                onClick={() =>
                                                    clearFormula(
                                                        rowIndex,
                                                        columnIndex
                                                    )
                                                }
                                            >
                                                Clear Formula
                                            </ContextMenuItem>
                                            <ContextMenuSub>
                                                <ContextMenuSubTrigger inset>
                                                    Change Formula
                                                </ContextMenuSubTrigger>
                                                <ContextMenuSubContent className="w-48">
                                                    {formulas
                                                        .filter(
                                                            (formula) =>
                                                                formula.fromulaType ===
                                                                "kpi"
                                                        )
                                                        .map((formula) => (
                                                            <ContextMenuItem
                                                                key={formula.id}
                                                                onClick={() =>
                                                                    setFormula(
                                                                        rowIndex,
                                                                        columnIndex,
                                                                        formula.id
                                                                    )
                                                                }
                                                            >
                                                                {formula.name}
                                                            </ContextMenuItem>
                                                        ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                )}

                                {row.rowType === "table" && (
                                    <ContextMenu>
                                        <ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md border border-dashed text-sm">
                                            <div className="mb-1">
                                                Chart Type:{" "}
                                                {row.config.chartType ||
                                                    "Not selected"}
                                            </div>
                                            <div className="mb-1">
                                                X-Axis:{" "}
                                                {row.config.x || "Not selected"}
                                            </div>
                                            {formulas.find(
                                                (f) => f.id === column
                                            ) ? (
                                                <>
                                                    <h5 className="mb-2 font-semibold">
                                                        {
                                                            formulas.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    column
                                                            )?.name
                                                        }
                                                    </h5>
                                                    <p className="mb-2 line-clamp-2">
                                                        {
                                                            formulas.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    column
                                                            )?.description
                                                        }
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="mb-2">
                                                    No Formula Selected
                                                </p>
                                            )}
                                            {formulaValues[column] ? (
                                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                                    {ArcAutoFormat(
                                                        formulaValues[column]
                                                    )}
                                                </h3>
                                            ) : (
                                                "Right click to configure"
                                            )}
                                        </ContextMenuTrigger>

                                        <ContextMenuContent className="w-64">
                                            <ContextMenuSub>
                                                <ContextMenuSubTrigger inset>
                                                    Select Chart Type
                                                </ContextMenuSubTrigger>
                                                <ContextMenuSubContent className="w-48">
                                                    {[
                                                        "bar-chart",
                                                        "line-chart",
                                                        "pie-chart",
                                                        "table",
                                                    ].map((chartType) => (
                                                        <ContextMenuItem
                                                            key={chartType}
                                                            onClick={() =>
                                                                updateRowConfig(
                                                                    rowIndex,
                                                                    {
                                                                        ...row.config,
                                                                        chartType:
                                                                            chartType as any,
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            {chartType}
                                                        </ContextMenuItem>
                                                    ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                            {row.config.chartType && (
                                                <ContextMenuSub>
                                                    <ContextMenuSubTrigger
                                                        inset
                                                    >
                                                        Select Formula
                                                    </ContextMenuSubTrigger>
                                                    <ContextMenuSubContent className="w-48">
                                                        {formulas
                                                            .filter(
                                                                (formula) =>
                                                                    formula.fromulaType ===
                                                                    "table"
                                                            )
                                                            .map((formula) => (
                                                                <ContextMenuItem
                                                                    key={
                                                                        formula.id
                                                                    }
                                                                    onClick={() =>
                                                                        updateRowConfig(
                                                                            rowIndex,
                                                                            {
                                                                                ...row.config,
                                                                                x: ""
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        formula.name
                                                                    }
                                                                </ContextMenuItem>
                                                            ))}
                                                    </ContextMenuSubContent>
                                                </ContextMenuSub>
                                            )}
                                            {row.config.chartType && (
                                            <ContextMenuSub>
                                                <ContextMenuSubTrigger inset>
                                                    Select X-Axis
                                                </ContextMenuSubTrigger>
                                                <ContextMenuSubContent className="w-48">
                                                    {formulas.map((formula) => (
                                                        <ContextMenuItem
                                                            key={formula.id}
                                                            onClick={() =>
                                                                updateRowConfig(
                                                                    rowIndex,
                                                                    {
                                                                        ...row.config,
                                                                        x: formula.id,
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            {formula.name}
                                                        </ContextMenuItem>
                                                    ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                            <ContextMenuItem
                                                inset
                                                onClick={() =>
                                                    removeColumn(
                                                        rowIndex,
                                                        columnIndex
                                                    )
                                                }
                                            >
                                                Remove Column
                                            </ContextMenuItem>
                                            <ContextMenuItem
                                                inset
                                                onClick={() =>
                                                    clearFormula(
                                                        rowIndex,
                                                        columnIndex
                                                    )
                                                }
                                            >
                                                Clear Formula
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                )}
                            </div>
                        ))}
                        {editMode && (
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-8 ${
                                    row.rowType === "kpi" ? "h-36" : "h-72"
                                }`} // Adjust height for kpi or table
                                onClick={() => addNewColumn(rowIndex)}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Add Column</span>
                            </Button>
                        )}
                    </div>
                ))}
                {editMode && (
                    <div className="p-4">
                        <Button
                            variant={"link"}
                            className="w-full"
                            onClick={() => addNewRow("kpi")}
                        >
                            + Add KPI
                        </Button>
                        <Button
                            variant={"link"}
                            className="w-full"
                            onClick={() => addNewRow("table")}
                        >
                            + Add Table/Chart
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
