"use client";

import ArcNavbar from "@/components/arcNavbar";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArcBreadcrumb from "@/components/navigation/arcBreadcrumb";
import ArcAvatar from "@/components/navigation/arcAvatar";
import UploadCSV from "../(importData)/uploadCsv";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/axios";
import { WorkbookInterface } from "@/interfaces/main";


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

    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [savedFormulas, setSavedFormulas] = useState<string[]>([
        "Formula 1",
        "Formula 2",
        "Formula 3",
    ]);

    const [activeLeftTab, setActiveLeftTab] = useState("import");
    const [activeRightTab, setActiveRightTab] = useState("chat");
    

    // --- Chat ---
    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            setChatMessages([...chatMessages, inputMessage]);
            setInputMessage("");
        }
    };

    if ((!workbook) || !workbookId || !workbook.dataTable) {
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
                    <div>
                        {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary">Import Data</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>Upload CSV</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu> */}
                    </div>
                </div>
                <div className="flex items-center justify-between pl-2 w-1/4">
                    <Tabs
                        value={activeRightTab}
                        onValueChange={setActiveRightTab}
                        className="w-auto"
                    >
                        <TabsList>
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                            <TabsTrigger value="saved">
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
                        <ScrollArea className="h-full p-4">
                            <h2 className="text-2xl font-bold mb-4">
                                Report Content
                            </h2>
                            <p>
                                This is where the report content would go. It
                                can scroll if it exceeds the available space.
                            </p>
                            {/* Add more content here to test scrolling */}
                        </ScrollArea>
                    )}
                    {activeLeftTab === "table" && (
                        <ScrollArea className="h-full p-4">
                            <h2 className="text-2xl font-bold mb-4">
                                Table Content
                            </h2>
                            <p>
                                This is where the table content would go. It can
                                scroll if it exceeds the available space.
                            </p>
                            {/* Add a table or more content here to test scrolling */}
                        </ScrollArea>
                    )}
                    {activeLeftTab === "import" && (
                        <ScrollArea className="h-full p-4">

                            <UploadCSV workbookId={workbookId as string} tableId={workbook.dataTable as string} />
                            {/* Add a table or more content here to test scrolling */}
                        </ScrollArea>
                    )}
                </div>
                <div className="w-1/4 border-l">
                    {activeRightTab === "chat" && (
                        <div className="h-full flex flex-col">
                            <ScrollArea className="flex-grow p-4">
                                {chatMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className="mb-2 p-2 bg-muted rounded-md"
                                    >
                                        {message}
                                    </div>
                                ))}
                            </ScrollArea>
                            <div className="p-4 border-t">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) =>
                                            setInputMessage(e.target.value)
                                        }
                                        placeholder="Type a message..."
                                        className="flex-grow"
                                    />
                                    <Button onClick={handleSendMessage}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeRightTab === "saved" && (
                        <ScrollArea className="h-full p-4">
                            {savedFormulas.map((formula, index) => (
                                <div
                                    key={index}
                                    className="mb-2 p-2 bg-muted rounded-md"
                                >
                                    {formula}
                                </div>
                            ))}
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
}
