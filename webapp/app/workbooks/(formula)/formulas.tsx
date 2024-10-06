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
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/services/axios";
import { FormulaInterface } from "@/interfaces/main";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Formulas({
    workbookId,
    isActive,
}: {
    workbookId: string;
    isActive: boolean;
}) {
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (isActive) {
            fetchFormulas();
        }
    }, [isActive]);

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

    const deleteFormula = async (id: string) => {
        try {
            await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/formulas/formula/${id}/`
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

    return (
        <div className="flex-grow p-4 overflow-y-auto">
            <Accordion type="single" collapsible>
                {formulas.map((formula) => (
                    <div key={formula.id}>
                        <AccordionItem value={formula.id} className="px-2">
                            <AccordionTrigger>
                                <p className="mb-2">{formula.name}</p>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="mb-2">{formula.description}</p>
                                <div className="bg-muted rounded p-1 mb-2">
                                    <p className="text-sm text-muted-foreground">
                                        Executed SQL
                                    </p>
                                    <code className="relative px-[0.3rem] py-[0.2rem] font-mono text-sm whitespace-pre-wrap break-words">
                                        {formula.validatedSQL}
                                    </code>
                                </div>
                                <div className="flex justify-between">
                                    <div></div>
                                    <AlertDialog>
                                        <AlertDialogTrigger variant="link">
                                            Delete
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
                                                    onClick={() =>
                                                        deleteFormula(
                                                            formula.id
                                                        )
                                                    }
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </div>
    );
}
