"use client";

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

export default function Report({ workbookId }: { workbookId: string }) {
    const { toast } = useToast();
    const [report, setReport] = useState<ReportInterface | null>(null);
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const [formulaValues, setFormulaValues] = useState<{
        [key: string]: string;
    }>({});

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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            <div className="p-4 flex justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Report</h2>
                </div>
                <div>
                    <Button variant="link" onClick={saveReport}>
                        Save
                    </Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {report?.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-4">
                        {row.map((column, columnIndex) => (
                            <div
                                key={`${rowIndex}${columnIndex}`}
                                className="w-1/4 h-36 border rounded-md"
                            >
                                <ContextMenu>
                                    <ContextMenuTrigger className="flex flex-col h-full w-full p-2 justify-center rounded-md border border-dashed text-sm">
                                        <h4 className=" my-2 text-xl tracking-tight">
                                            {formulaValues[column] ||
                                                "Select Formula"}
                                        </h4>
                                        {formulas.find(
                                            (f) => f.id === column
                                        ) ? (
                                            <>
                                                <p className="mb-2">
                                                    {
                                                        formulas.find(
                                                            (f) =>
                                                                f.id === column
                                                        )?.name
                                                    }
                                                </p>
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
                            </div>
                        ))}
                        {row.length < 4 && (
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
                <div className="p-4">
                    <Button
                        variant={"link"}
                        className="w-full"
                        onClick={addNewRow}
                    >
                        + Add New Row
                    </Button>
                </div>
            </div>
        </div>
    );
}
