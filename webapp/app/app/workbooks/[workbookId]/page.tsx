"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArcBreadcrumb from "../../sub-components/navigation/arcBreadcrumb";
import ArcAvatar from "../../sub-components/navigation/arcAvatar";
import UploadCSV from "../(importData)/uploadCsv";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/services/axios";
import { WorkbookInterface } from "@/interfaces/main";
import ArcDataTable from "../(table)/dataTable";
import AnalysisChat from "../(chat)/pqlChat";
import Formulas from "../(formula)/formulas";
import Report from "../(report)/report";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export default function Page() {
    const { toast } = useToast();

    const { workbookId } = useParams();
    const [workbook, setWorkbook] = useState<WorkbookInterface | null>(null);
    const router = useRouter();

    // Fetch tableId when workbookId is available
    useEffect(() => {
        if (workbookId) {
            fetchWorkbook();
        }
    }, [workbookId]);

    const fetchWorkbook = async () => {
        try {
            // Fetch all workbooks
            const workbooksResponse = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`
            );
            const workbooksData = await workbooksResponse.data;
            console.log(workbooksData);
            setWorkbook(workbooksData);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error to get workbook",
                description:
                    error.response?.data?.error || "Failed to load workbook",
            });
        }
    };

    const [activeLeftTab, setActiveLeftTab] = useState("table");

    const handleDeleteWorkbook = async () => {
        try {
            // Fetch all workbooks
            const workbooksResponse = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/`
            );
            setWorkbook(null);
            router.push("/app/workbooks");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error to get workbook",
                description:
                    error.response?.data?.error || "Failed to load workbook",
            });
        }
    }

    if (!workbook || !workbookId || !workbook.dataTable) {
        return (
            <div className="flex flex-col justify-between m-auto items-center h-screen bg-background">
                <div>Loading...</div>;
            </div>
        );
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
                <div className="flex justify-end items-center gap-4 pl-2 w-1/4 ">
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Trash2 size={16} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this workbook, its data,
                                    related formulas, chats, reports, and all
                                    other related data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteWorkbook}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <ArcAvatar />
                </div>
            </nav>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-grow">
                    {activeLeftTab === "report" && (
                        <Report
                            workbookId={workbookId as string}
                            reportId={workbook.report as string}
                        />
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
                    <Formulas
                        workbookId={workbookId as string}
                        tableId={workbook.dataTable as string}
                        // trigger refresh when tab is active
                    />
                </div>
            </div>
        </div>
    );
}
