"use client";

import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/services/axios";
import {
    FormulaInterface,
} from "@/interfaces/main";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Formulas({ workbookId }: { workbookId: string }) {
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchFormulas();
    }, []);

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
                `${process.env.NEXT_PUBLIC_API_URL}/formulas/${id}/`
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
        <div>
            <div>
                {formulas.map((formula) => (
                    <div key={formula.id}>
                        <h2>{formula.name}</h2>
                        <Button onClick={() => deleteFormula(formula.id)}>
                            Delete
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
