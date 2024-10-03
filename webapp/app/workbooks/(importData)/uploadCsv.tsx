"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnMetaInterface } from "@/interfaces/main";
import { set } from "date-fns";
// import { useToast } from "@/components/hooks/use-toast"

const dataTypes = ["string", "integer", "float", "date"];
const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "DD-MM-YYYY"];

export default function UploadCSV() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<DataTableColumnMetaInterface[]>([]);
    const [tableName, setTableName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // const { toast } = useToast()

    useEffect(() => {
        if (data.length > 0) {
            setTableName("imported_table"); // Set table name from file, or adjust dynamically
        }
    }, [data]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target?.result as string;
                try {
                    const parsedData = d3.csvParse(csv);
                    setData(parsedData);
                    setColumns(
                        Object.keys(parsedData[0] || {}).map((name) => ({
                            id: name,
                            name: name,
                            dtype: "string",
                            format: "",
                            description: "",
                        }))
                    );
                    setIsOpen(true);
                    console.log("headers", columns);
                } catch (error) {
                    console.error("Failed to parse CSV", error);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleColumnTypeChange = (
        columnName: string,
        dtype: "string" | "integer" | "float" | "date",
        format: string = ""
    ) => {
        if (
            !dataTypes.includes(dtype) ||
            (dtype === "date" && !dateFormats.includes(format))
        ) {
            return;
        }

        setColumns((prevColumns) =>
            prevColumns.map((column) => {
                if (column.name === columnName) {
                    return {
                        ...column,
                        dtype: dtype,
                        format: dtype === "date" ? format : "",
                    };
                }
                return column;
            })
        );

        console.log("columns", columns);
    };

    // Validation logic
    const validateTableName = () => {
        if (!tableName) {
            // toast({
            //     title: "Error",
            //     description: "Table name is required",
            //     variant: "error",
            // });
            return false;
        }
        return true;
    };

    const validateColumns = () => {
        if (columns.length === 0) {
            // toast({
            //     title: "Error",
            //     description: "No columns detected",
            //     variant: "error",
            // });
            return false;
        }
        return true;
    };

    const validateDataTypes = () => {
        // Here you can check if the data types in the columns match the actual data in `data`
        return true; // Placeholder for actual validation logic
    };

    const validateData = () => {
        return validateTableName() && validateColumns() && validateDataTypes();
    };

    const handleSave = () => {
        if (!validateData()) {
            return;
        }

        const saveData = {
            data,
            columns,
            name: tableName,
        };

        // Simulating save process (replace with API call)
        console.log("Saving data:", saveData);

        // toast({
        //     title: "Success",
        //     description: "Data saved successfully",
        //     variant: "success",
        // });
        setIsOpen(false);
    };
    return (
        <div>
            <div className="flex justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Import Data</h2>
                </div>
                <div>
                    <Button
                        variant="link"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        + Upload CSV
                    </Button>
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                style={{ display: "none" }}
            />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Upload CSV</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column.name}>
                                            {column.name}
                                            <Badge
                                                variant="secondary"
                                                className="ml-2"
                                            >
                                                {column.dtype}
                                            </Badge>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.slice(0, 5).map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell key={column.name}>
                                                {row[column.name]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        {columns.map((column) => (
                            <div key={column.name}>
                                <Select
                                    value={column.dtype}
                                    onValueChange={(
                                        value:
                                            | "string"
                                            | "integer"
                                            | "float"
                                            | "date"
                                    ) =>
                                        handleColumnTypeChange(
                                            column.name,
                                            value,
                                            column.format
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="string">
                                            String
                                        </SelectItem>
                                        <SelectItem value="integer">
                                            Integer
                                        </SelectItem>
                                        <SelectItem value="float">
                                            Float
                                        </SelectItem>
                                        <SelectItem value="date">
                                            Date
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {column.dtype === "date" && (
                                    <Select
                                        onValueChange={(value) =>
                                            handleColumnTypeChange(
                                                column.name,
                                                "date",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Date Format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MM/DD/YYYY">
                                                MM/DD/YYYY
                                            </SelectItem>
                                            <SelectItem value="DD/MM/YYYY">
                                                DD/MM/YYYY
                                            </SelectItem>
                                            <SelectItem value="MM-DD-YYYY">
                                                MM-DD-YYYY
                                            </SelectItem>
                                            <SelectItem value="DD-MM-YYYY">
                                                DD-MM-YYYY
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
