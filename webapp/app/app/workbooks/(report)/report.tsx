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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface, ReportInterface } from "@/interfaces/main";
import { ArcAutoFormat } from "@/services/autoFormat";
import ArcStackedBarChart from "../../sub-components/navigation/report/arcStackedBarChart";

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
        [key: string]: any;
    }>({});
    const [editMode, setEditMode] = useState(true);

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

            // Fetch values for all formulas in the report
            const formulaIds = fetchedReport.rows
                .flatMap((row) => row.columns.map((col) => col.formula))
                .filter((id, index, self) => id && self.indexOf(id) === index);

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
            setFormulas(response.data);
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
            if (!report) return;

            clearEmtyCells();
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

    const updateColumn = (
        rowIndex: number,
        columnIndex: number,
        updates: Partial<ReportInterface["rows"][number]["columns"][number]>
    ) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex].columns[columnIndex] = {
            ...updatedRows[rowIndex].columns[columnIndex],
            ...updates,
        };
        console.log(updatedRows);
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
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/value/`
            );
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
    
        const cleanRows = report.rows.map(row => ({
          ...row,
          columns: row.columns.filter(column => column.formula != null && column.formula.trim() !== ''),
        }));
      
        const filteredRows = cleanRows.filter(row => row.columns.length > 0);
      
        setReport(prevReport => (prevReport ? { ...prevReport, rows: filteredRows } : prevReport));
      };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="edit-mode"
                        onCheckedChange={setEditMode}
                        checked={editMode}
                    />
                    <Label htmlFor="edit-mode">Edit Mode</Label>
                </div>
                {editMode && (
                    <div>

                    <Button variant="link" onClick={saveReport}>
                        Save
                    </Button>
                    <Button variant="link" onClick={clearEmtyCells}>
                    Clear Empty Cells
                </Button>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-bold mb-4">Report</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {report?.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-4">
                        {row.columns.map((column, columnIndex) => (
                            <div
                                key={`${rowIndex}-${columnIndex}`}
                                className={`${
                                    editMode
                                        ? row.rowType === "kpi"
                                            ? "w-1/4 h-36"
                                            : "w-1/2 h-84"
                                        : "w-full"
                                } border rounded-md`}
                            >
                                <ContextMenu>
                                    <ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md border border-dashed text-sm">
                                        {row.rowType === "kpi" && (
                                            <>
                                                {!column.formula ? (
                                                    <p>No Formula Selected</p>
                                                ) : !formulaValues[
                                                      column.formula
                                                  ] ? (
                                                    <p>
                                                        Right click to select a
                                                        formula
                                                    </p>
                                                ) : (
                                                    <>
                                                        {/* Display formula details if a formula is selected and has values */}
                                                        <>
                                                            <h5 className="mb-2 font-semibold">
                                                                {
                                                                    formulas.find(
                                                                        (f) =>
                                                                            f.id ===
                                                                            column.formula
                                                                    )?.name
                                                                }
                                                            </h5>
                                                            <p className="mb-2 line-clamp-2">
                                                                {
                                                                    formulas.find(
                                                                        (f) =>
                                                                            f.id ===
                                                                            column.formula
                                                                    )
                                                                        ?.description
                                                                }
                                                            </p>
                                                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                                                {ArcAutoFormat(
                                                                    formulaValues[
                                                                        column
                                                                            .formula
                                                                    ]
                                                                )}
                                                            </h3>
                                                        </>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {row.rowType === "table" && (
                                            <>
                                                {/* Handle the case where no formula or formula values are present */}
                                                {!column.formula ||
                                                !formulaValues[
                                                    column.formula
                                                ] ||
                                                !column.config.x ||
                                                column.config.x === "" ? (
                                                    <>
                                                        <div className="mb-1">
                                                            Chart Type:{" "}
                                                            {column.config
                                                                .chartType ||
                                                                "Not selected"}
                                                        </div>
                                                        <div className="mb-1">
                                                            X-Axis:{" "}
                                                            {column.config.x ||
                                                                "Not selected"}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {column.config
                                                            .chartType ===
                                                            "bar-chart" && (
                                                            <ArcStackedBarChart
                                                                data={
                                                                    formulaValues[
                                                                        column
                                                                            .formula
                                                                    ]
                                                                }
                                                                x={
                                                                    column
                                                                        .config
                                                                        .x
                                                                }
                                                                name={
                                                                    formulas.find(
                                                                        (f) =>
                                                                            f.id ===
                                                                            column.formula
                                                                    )?.name ||
                                                                    ""
                                                                }
                                                                description={
                                                                    formulas.find(
                                                                        (f) =>
                                                                            f.id ===
                                                                            column.formula
                                                                    )
                                                                        ?.description ||
                                                                    ""
                                                                }
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </ContextMenuTrigger>

                                    <ContextMenuContent className="w-64">
                                        {row.rowType === "table" && (
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
                                                                updateColumn(
                                                                    rowIndex,
                                                                    columnIndex,
                                                                    {
                                                                        config: {
                                                                            ...column.config,
                                                                            chartType:
                                                                                chartType as any,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            {chartType}
                                                        </ContextMenuItem>
                                                    ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                        )}

                                        <ContextMenuSub>
                                            <ContextMenuSubTrigger inset>
                                                Select Formula
                                            </ContextMenuSubTrigger>
                                            <ContextMenuSubContent className="w-48">
                                                {formulas
                                                    .filter(
                                                        (formula) =>
                                                            formula.fromulaType ===
                                                            (row.rowType ===
                                                            "kpi"
                                                                ? "kpi"
                                                                : "table")
                                                    )
                                                    .map((formula) => (
                                                        <ContextMenuItem
                                                            key={formula.id}
                                                            onClick={() => {
                                                                updateColumn(
                                                                    rowIndex,
                                                                    columnIndex,
                                                                    {
                                                                        formula:
                                                                            formula.id,
                                                                    }
                                                                );
                                                                fetchFormulaValue(
                                                                    formula.id
                                                                );
                                                            }}
                                                        >
                                                            {formula.name}
                                                        </ContextMenuItem>
                                                    ))}
                                            </ContextMenuSubContent>
                                        </ContextMenuSub>
                                        {row.rowType === "table" &&
                                            row.columns[columnIndex].formula &&
                                            Object.keys(formulaValues).includes(
                                                row.columns[columnIndex].formula
                                            ) && ( // because the formula might not have been fetched yet and this will cause an error
                                                <ContextMenuSub>
                                                    <ContextMenuSubTrigger
                                                        inset
                                                    >
                                                        Select X-Axis
                                                    </ContextMenuSubTrigger>
                                                    <ContextMenuSubContent className="w-48">
                                                        {Object.keys(
                                                            formulaValues[
                                                                row.columns[
                                                                    columnIndex
                                                                ].formula
                                                            ][0] || {}
                                                        ).map((key) => (
                                                            <ContextMenuItem
                                                                key={key}
                                                                onClick={() =>
                                                                    updateColumn(
                                                                        rowIndex,
                                                                        columnIndex,
                                                                        {
                                                                            config: {
                                                                                ...column.config,
                                                                                x: key,
                                                                            },
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                {key}
                                                            </ContextMenuItem>
                                                        ))}
                                                    </ContextMenuSubContent>
                                                </ContextMenuSub>
                                            )}

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
                                                clearColumn(
                                                    rowIndex,
                                                    columnIndex
                                                )
                                            }
                                        >
                                            Clear Column
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            </div>
                        ))}
                        {editMode && (
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-8 ${
                                    row.rowType === "kpi" ? "h-36" : "h-72"
                                }`}
                                onClick={() => addNewColumn(rowIndex)}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Add Column</span>
                            </Button>
                        )}
                    </div>
                ))}
                {editMode && (
                    <div className="py-4 flex justify-center mb-2">
                        <Button
                            variant="link"
                            onClick={() => addNewRow("kpi")}
                        >
                            + Add KPI
                        </Button>
                        <Button
                            variant="link"
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
