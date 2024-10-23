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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface } from "@/interfaces/main";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AnalysisChat from "../(chat)/pqlChat";

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
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching formulas",
                description:
                    error.response?.data?.error || "Failed to load formulas",
            });
        }
    };

    const deleteFormula = async (id: string) => {
        try {
            await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${id}`
            );
            setFormulas(formulas.filter((formula) => formula.id !== id));
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error deleting formula",
                description: error.response.data.error,
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
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error creating formula",
                description: error.response.data.error,
            });
        }
    };


    return (
        <div className="flex-grow p-4 overflow-y-auto">
            {activeFormula ? (
                <>
                    <div className="flex justify-between">
                        <div></div>
                        <div>
                            <Button variant="link" onClick={() => setActiveFormula(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                    <AnalysisChat
                        workbookId={workbookId}
                        tableId={tableId}
                        formulaId={activeFormula.id}
                    />
                </>
            ) : (
                <>
                    <div className="flex justify-between">
                        <div></div>
                        <div>
                            <Button variant="link" onClick={handleCreateFormula}>
                                + New Metric
                            </Button>
                        </div>
                    </div>
                    {formulas.map((formula) => (
                        <div
                            key={formula.id}
                            onClick={() => setActiveFormula(formula)}
                        >
                            <Card className="flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {formula.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* <p className="mb-2">{fromula.}</p> */}
                                    <p className="text-xs text-muted-foreground">
                                        {formula.description ||
                                            "No description"}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div></div>
                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <Button variant="link">
                                                Delete
                                            </Button>
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
                                                    onClick={() => {}}
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
