"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArcBreadcrumb from "@/components/navigation/arcBreadcrumb";
import ArcAvatar from "@/components/navigation/arcAvatar";
import UploadCSV from "../(importData)/uploadCsv";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/axios";
import { WorkbookInterface } from "@/interfaces/main";
import ArcDataTable from "../(table)/dataTable";
import StandardChat from "../(chat)/standardChat";
import AnalysisChat from "../(chat)/pqlChat";
import Formulas from "../(formula)/formulas";
import Report from "../(report)/report";

export default function Page() {
    const { workbookId } = useParams();
    const [workbook, setWorkbook] = useState<WorkbookInterface | null>(null);
    // Fetch tableId when workbookId is available
    useEffect(() => {
        if (workbookId) {
            axiosInstance.get(`/workbooks/${workbookId}/`).then((response) => {
                setWorkbook(response.data);
            });
        }
    }, [workbookId]);

    const [activeLeftTab, setActiveLeftTab] = useState("report");
    const [activeRightTab, setActiveRightTab] = useState("savedFormula");

    if (!workbook || !workbookId || !workbook.dataTable) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <nav className="px-4 py-2 flex justify-between items-center border-b">
                <div className="flex flex-grow items-center justify-between">
                    <ArcBreadcrumb />
                    <Tabs
                        value={activeLeftTab}
                        onValueChange={setActiveLeftTab}
                        className="w-auto"
                    >
                        <TabsList>
                            <TabsTrigger value="report">Report</TabsTrigger>
                            <TabsTrigger value="table">Table</TabsTrigger>
                            <TabsTrigger value="import">Import</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div></div>
                </div>
                <div className="flex items-center justify-between pl-2 w-1/4">
                    <Tabs
                        value={activeRightTab}
                        onValueChange={setActiveRightTab}
                        className="w-auto"
                    >
                        <TabsList>
                            <TabsTrigger value="standardChat">Chat</TabsTrigger>
                            <TabsTrigger value="analysisChat">Analysis</TabsTrigger>
                            <TabsTrigger value="savedFormula">
                                Saved Formula
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <ArcAvatar />
                </div>
            </nav>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-grow">
                    {activeLeftTab === "report" && (
                        <Report workbookId={workbookId as string} />
                    )}
                    {activeLeftTab === "table" && (
                        <ArcDataTable
                            workbookId={workbookId as string}
                            tableId={workbook.dataTable}
                        />
                    )}
                    {activeLeftTab === "import" && (
                        <ScrollArea className="h-full p-4">
                            <UploadCSV
                                workbookId={workbookId as string}
                                tableId={workbook.dataTable as string}
                            />
                        </ScrollArea>
                    )}
                </div>
                <div className="w-1/4 border-l">
                    {activeRightTab === "standardChat" && (
                        <StandardChat workbookId={workbookId as string} tableId={workbook.dataTable} />
                    )}
                    {activeRightTab === "analysisChat" && (
                        <AnalysisChat workbookId={workbookId as string} tableId={workbook.dataTable} />
                    )}
                    {activeRightTab === "savedFormula" && (
                        <Formulas workbookId={workbookId as string} isActive={activeRightTab === "savedFormula"}/>
                        // trigger refresh when tab is active
                    )}
                </div>
            </div>
        </div>
    );
}
