"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, ChevronRight } from "lucide-react";
import axiosInstance from "@/services/axios";
import { WorkbookInterface } from "@/interfaces/main";
import { addDays, format } from "date-fns";
import ArcNavbar from "@/components/arcNavbar";

export default function WorkbooksPage() {
    const [workbooks, setWorkbooks] = useState<WorkbookInterface[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Fetch workbooks from API
        fetchWorkbooks();
    }, []);

    const fetchWorkbooks = async () => {
        try {
            const response = await axiosInstance.get(
                process.env.NEXT_PUBLIC_API_URL + "/workbooks/"
            );
            const data = await response.data;
            setWorkbooks(data);
        } catch (error) {
            console.error("Error fetching workbooks", error);
        }
    };

    const createWorkbook = async () => {
        try {
            const response = await axiosInstance.post(
                process.env.NEXT_PUBLIC_API_URL + "/workbooks/", {}
            );
            const newWorkbook = await response.data;
            setWorkbooks([...workbooks, newWorkbook]);
        } catch (error) {
            console.error("Error creating workbook", error);
        }
    };

    // const deleteWorkbook = async (id: string) => {
    //     // Simulating API call to delete a workbook
    //     await fetch(`/api/workbooks/${id}`, { method: "DELETE" });
    //     setWorkbooks(workbooks.filter((workbook) => workbook.id !== id));
    // };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ArcNavbar />

            <main className="flex-grow p-6 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <NewWorkbookCard onCreate={createWorkbook} />
                    {workbooks.map((workbook) => (
                        <WorkbookCard key={workbook.id} workbook={workbook} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function NewWorkbookCard({ onCreate }: { onCreate: () => void }) {
    return (
        <Card
            className="flex items-center justify-center cursor-pointer hover:bg-accent"
            onClick={onCreate}
        >
            <CardContent>
                <Button variant="ghost" size="icon">
                    <Plus className="h-6 w-6" />
                </Button>
            </CardContent>
        </Card>
    );
}

function WorkbookCard({ workbook }: { workbook: WorkbookInterface }) {
    const router = useRouter();
    const handleCardClick = () => {
        router.push(`/workbooks/${workbook.id}`); // Navigate to workbooks/:id 
    };

    return (
        <Card
            className="flex flex-col cursor-pointer hover:bg-accent"
            onClick={handleCardClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {workbook.dataTable}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    {workbook.dataTable}
                </p>
            </CardContent>
            <CardFooter className="mt-auto">
                <p className="text-xs text-muted-foreground">
                    {format(workbook.createdAt, "PPP")}
                </p>
            </CardFooter>
        </Card>
    );
}
