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
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface, ReportInterface } from "@/interfaces/main";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Plus } from "lucide-react";
import { ArcAutoFormat } from "@/services/autoFormat";

export default function Report({ workbookId }: { workbookId: string }) {
    const { toast } = useToast();
    const [report, setReport] = useState<ReportInterface | null>(null);
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const [formulaValues, setFormulaValues] = useState<{
        [key: string]: string;
    }>({});
    const [editMode, setEditMode] = useState(false);

    // Report
    useEffect(() => {
        fetchReport();
        fetchFormulas();
    }, []);

    const fetchReport = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/report/workbook/${workbookId}/`
            );
            const fetchedReport: ReportInterface = response.data;
            setReport(fetchedReport);

            // Check for any pre-selected formulas and fetch their values
            const formulaIds: string[] = [];
            fetchedReport.rows.forEach((row) => {
                row.forEach((col) => {
                    if (col) {
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
                `${process.env.NEXT_PUBLIC_API_URL}/formulas/workbook/${workbookId}/`
            );
            const fetchedFormulas: FormulaInterface[] = response.data;
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
                `${process.env.NEXT_PUBLIC_API_URL}/report/workbook/${workbookId}/`,
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

        const updatedRows = [...report.rows];
        updatedRows[rowIndex][columnIndex] = formulaId;
        setReport({
            ...report,
            rows: updatedRows,
        });

        // Fetch the formula value only when it's set
        fetchFormulaValue(formulaId);
    };

    const removeColumn = (rowIndex: number, columnIndex: number) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex].splice(columnIndex, 1);
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const clearFormula = (rowIndex: number, columnIndex: number) => {
        if (!report) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex][columnIndex] = "";
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const fetchFormulaValue = async (formulaId: string) => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/formulas/formula/${formulaId}/value/`
            );
            setFormulaValues((prev) => ({
                ...prev,
                [formulaId]: response.data.value,
            }));
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching formula value",
                description: error.response.data.error,
            });
        }
    };

    // Layout
    const addNewRow = () => {
        if (!report) return;
        const newRow: string[] = [];
        setReport({
            ...report,
            rows: [...report.rows, newRow],
        });
    };

    const addNewColumn = (rowIndex: number) => {
        if (!report || report.rows[rowIndex].length >= 4) return;

        const updatedRows = [...report.rows];
        updatedRows[rowIndex] = [...updatedRows[rowIndex], ""];
        setReport({
            ...report,
            rows: updatedRows,
        });
    };

    const clearEmptyCells = () => {
        if (!report) return;
        console.log(report);
    
        // Remove empty columns (columns that are "")
        const cleanedRows = report.rows.map((row) =>
            // Filter out empty columns including ones with already deleted formulas
            row.filter((column) => column !== "" && formulaValues[column])
        );
    
        // Remove empty rows (rows that are [])
        const filteredRows = cleanedRows.filter((row) => row.length > 0);
    
        // Update the report state with cleaned rows
        setReport({
            ...report,
            rows: filteredRows,
        });
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
                            <Button variant="link" className="px-3" onClick={clearEmptyCells}>
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
                        {row.map((column, columnIndex) => (
                            <div
                                key={`${rowIndex}${columnIndex}`}
                                className={`${
                                    editMode ? "w-1/4" : "w-full"
                                } h-36 border rounded-md`}
                            >
                                {editMode ? (
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
                                                    <p className="mb-2">
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
                                                    {formulas.map((formula) => (
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
                                ) : (
                                    <div className="flex flex-col h-full w-full p-2 justify-center rounded-md text-sm">
                                        {formulas.find(
                                            (f) => f.id === column
                                        ) ? (
                                            <>
                                                <h5 className="mb-2 font-semibold">
                                                    {
                                                        formulas.find(
                                                            (f) =>
                                                                f.id === column
                                                        )?.name
                                                    }
                                                </h5>
                                                <p className="mb-2">
                                                    {
                                                        formulas.find(
                                                            (f) =>
                                                                f.id === column
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
                                            "Please select a formula in edit mode"
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {editMode && row.length < 4 && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-36"
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
                            onClick={addNewRow}
                        >
                            + Add New Row
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
