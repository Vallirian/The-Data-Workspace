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
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import { ErrorInterface, FormulaInterface } from "@/interfaces/main";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AnalysisChat from "../(chat)/pqlChat";
import { Code2, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "sql-formatter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Formulas({
    workbookId,
    tableId,
}: {
    workbookId: string;
    tableId: string;
}) {
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const [activeFormula, setActiveFormula] = useState<FormulaInterface | null>(
        null
    );
    const { toast } = useToast();

    useEffect(() => {
        fetchFormulas();
    }, [workbookId]);

    const fetchFormulas = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`
            );
            const fetchedFormulas: FormulaInterface[] = response.data;
            setFormulas(fetchedFormulas);
        } catch (error: unknown) {
            const err = error as ErrorInterface;
            toast({
                variant: "destructive",
                title: "Error fetching formulas",
                description:
                    err.response?.data?.error || "Failed to load formulas",
            });
        }
    };

    const deleteFormula = async (id: string) => {
        try {
            await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${id}`
            );
            setFormulas(formulas.filter((formula) => formula.id !== id));
        } catch (error: unknown) {
            const err = error as ErrorInterface;
            toast({
                variant: "destructive",
                title: "Error deleting formula",
                description: err.response.data.error,
            });
        }
    };

    // edit formula
    const handleCreateFormula = async () => {
        try {
            const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`,
                { dataTable: tableId }
            );
            const newFormula: FormulaInterface = response.data;
            setFormulas([...formulas, newFormula]);
            setActiveFormula(newFormula);
        } catch (error: unknown) {
            const err = error as ErrorInterface;
            toast({
                variant: "destructive",
                title: "Error creating formula",
                description: err.response.data.error,
            });
        }
    };

    const handleCloseFormulaEditor = () => {
        fetchFormulas();
        setActiveFormula(null);
    };

    return (
        <div className="h-full px-4 overflow-y-auto">
            {activeFormula ? (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2">
                        <div>
                            <small className="text-sm font-semibold leading-none">
                                {activeFormula.name || "Untitled Formula"}
                            </small>
                        </div>
                        <div>
                            <Button
                                variant="link"
                                onClick={handleCloseFormulaEditor}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <AnalysisChat
                            workbookId={workbookId}
                            tableId={tableId}
                            formulaId={activeFormula.id}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center px-4 py-2">
                        <div>
                            <small className="text-sm font-semibold leading-none">
                                Select to Edit or Create New
                            </small>
                        </div>
                        <div>
                            <Button
                                variant="link"
                                onClick={handleCreateFormula}
                            >
                                + New Metric
                            </Button>
                        </div>
                    </div>
                    {formulas.map((formula) => (
                        <div key={formula.id}>
                            <Card className="flex flex-col mb-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {formula.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                    <p className="text-xs text-muted-foreground">
                                        {formula.description ||
                                            "No description"}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex py-1">
                                    <Button
                                        variant="link"
                                        size="icon"
                                        onClick={() =>
                                            setActiveFormula(formula)
                                        }
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" size="icon">
                                                <Code2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    View SQL
                                                </span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] w-[90vw]">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    SQL for {formula.name}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription className="max-h-[60vh] overflow-hidden flex flex-col">
                                                <ScrollArea className="w-full rounded-md border flex-grow">
                                                    <div className="p-4">
                                                        <SyntaxHighlighter
                                                            language="sql"
                                                            style={oneLight}
                                                            customStyle={{
                                                                margin: 0,
                                                                padding: 0,
                                                                background:
                                                                    "transparent",
                                                            }}
                                                            wrapLines={true}
                                                            wrapLongLines={true}
                                                        >
                                                            {format(
                                                                formula.arcSql ||
                                                                    "No SQL"
                                                            )}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                    <ScrollBar orientation="horizontal" />
                                                </ScrollArea>
                                                <p className="text-sm text-muted-foreground py-2 mt-2">
                                                    {formula.description}
                                                </p>
                                            </DialogDescription>
                                        </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <Trash2 size={14} />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently delete the saved
                                                    formula and remove it from
                                                    report.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => {deleteFormula(formula.id)}}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
