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
    const [report, setReport] = useState<ReportInterface | null>(null);
    const { toast } = useToast();
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);

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
                    <h2 className="text-2xl font-bold mb-4">Import Data</h2>
                </div>
                <div>
                    <Button variant="link">Save</Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {report?.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-4">
                        {row.map((column, columnIndex) => (
                            <div
                                key={`${rowIndex}${columnIndex}`}
                                className="w-1/4 h-32 border rounded-md"
                            >
                                <ContextMenu>
                                    <ContextMenuTrigger className="flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
                                        {`${rowIndex}${columnIndex}`}
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-64">
                                        <ContextMenuItem inset>
                                            Remove Column
                                        </ContextMenuItem>
                                        <ContextMenuItem inset>
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
                                className="w-8 h-32"
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
