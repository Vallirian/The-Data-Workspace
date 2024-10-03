"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    DataTableColumnMetaInterface,
    DataTableMetaInterface,
} from "@/interfaces/main";
import { format, set } from "date-fns";
import ImportDataService from "./validateUpload";
import axiosInstance from "@/services/axios";
import { MoreVertical } from "lucide-react";

const dataTypes = ["string", "integer", "float", "date"];
const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "MM-DD-YYYY",
    "DD-MM-YYYY",
    "",
];

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { UploadCSVProps } from "@/interfaces/props";


export default function UploadCSV({ workbookId, tableId }: UploadCSVProps) {
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);

    const [tableMeta, setTableMeta] = useState<DataTableMetaInterface | null>(
        null
    );
    const [columns, setColumns] = useState<DataTableColumnMetaInterface[]>([]);
    const { validateTableName, validateColumnNames, validateDataTypes } =
        ImportDataService();

    const [tableName, setTableName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data.length > 0) {
            setTableName("imported_table"); // Set table name from file, or adjust dynamically
        }
    }, [data]);

    // file upload
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target?.result as string;
                try {
                    const parsedData = d3.csvParse(csv);
                    setData(parsedData);
                    if (parsedData) {
                        setTableMeta({
                            id: file.name.split(".")[0],
                            name: file.name.split(".")[0],
                            description: "",
                            dataSourceAdded: true,
                            dataSource: "csv",
                            extractionStatus: "pending",
                            extractionDetails: "",
                            columns: [],
                        });
                    }
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
        dtype: "string" | "integer" | "float" | "date"
    ) => {
        if (!dataTypes.includes(dtype)) {
            return;
        }

        setColumns((prevColumns) =>
            prevColumns.map((column) => {
                if (column.name === columnName) {
                    return {
                        ...column,
                        dtype: dtype,
                    };
                }
                return column;
            })
        );
    };

    const handleColumnFormatChange = (
        columnName: string,
        format: "MM/DD/YYYY" | "DD/MM/YYYY" | "MM-DD-YYYY" | "DD-MM-YYYY"
    ) => {
        if (!dateFormats.includes(format)) {
            return;
        }
        setColumns((prevColumns) =>
            prevColumns.map((column) => {
                if (column.name === columnName) {
                    if (column.dtype !== "date") {
                        return column;
                    }

                    return {
                        ...column,
                        format: format,
                    };
                }
                return column;
            })
        );
    };

    const validateData = () => {
        if (!data.length || !tableMeta) {
            return false;
        }
        const tableNameValidation = validateTableName(tableMeta.name);
        if (!tableNameValidation.result) {
            console.error(
                "Table name validation failed:",
                tableNameValidation.message
            );
            return false;
        }

        const columnNames = columns.map((column) => column.name);
        const columnValidation = validateColumnNames(columnNames);
        if (!columnValidation.result) {
            console.error(
                "Column name validation failed:",
                columnValidation.message
            );
            return false;
        }

        const dataTypes = columns.map((column) => column.dtype);
        const dataTypeValidation = validateDataTypes(data, dataTypes);
        if (!dataTypeValidation.result) {
            console.error(
                "Data type validation failed:",
                dataTypeValidation.message
            );
            return false;
        }

        return true;
    };

    // raw data API
    const handleSave = async () => {
        if (!validateData()) {
            return;
        }

        try {
            const uploadDataPostResponse = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/extract/`,
                {
                    data: data,
                    columns: columns,
                    dataSource: "csv",
                    name: tableMeta?.name || "Unknown Table",
                }
            );

            refreshTableMeta();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error saving data",
                description: error.response.data.error
                    ? error.response.data.error
                    : "An error occurred while saving data",
                action: <ToastAction altText="Ok">Ok</ToastAction>,
            });
            return;
        }

        toast({
            title: "Success",
            description: "Data saved successfully",
            action: <ToastAction altText="Ok">Ok</ToastAction>,
        });

        setIsOpen(false);
    };

    const handleDelete = async () => {
        try {
            const deleteDataResponse = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/extract/`
            );

            refreshTableMeta();
        } catch (error: any) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Error deleting data",
                description: "An error occurred while deleting data",
                action: <ToastAction altText="Ok">Ok</ToastAction>,
            });
            return;
        }

        toast({
            title: "Success",
            description: "Data deleted successfully",
            action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
    };

    // table meta
    useEffect(() => {
        if (!workbookId || !tableId) {
            return;
        }

        const fetchTableMeta = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/`
                );
                setTableMeta(response.data);
            } catch (error) {
                console.error("Error fetching table meta", error);
            }
        };

        fetchTableMeta();
    }, [workbookId, tableId]);

    const refreshTableMeta = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/`
            );
            setTableMeta(response.data);
        } catch (error) {
            console.error("Error refreshing table meta", error);
        }
    };

    if (!workbookId || !tableId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Toaster />

            <div className="flex justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Import Data</h2>
                </div>
                <div>
                    <Button
                        variant="link"
                        onClick={() => {
                            if (tableMeta?.dataSourceAdded) {
                                console.log("Data source already added");
                                toast({
                                    variant: "destructive",
                                    title: "Data source already added",
                                    description:
                                        "Please delete existing data source to upload new data",
                                    action: (
                                        <ToastAction altText="Ok">
                                            Ok
                                        </ToastAction>
                                    ),
                                });
                            } else {
                                fileInputRef.current?.click();
                            }
                        }}
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

            <Card className="flex flex-col cursor-pointer hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {tableMeta?.name || "Unknown Table"}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDelete}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">
                        {tableMeta?.description || "No description"}
                    </p>
                </CardContent>
                <CardFooter className="mt-auto">
                    <p className="text-xs text-muted-foreground">
                        {tableMeta?.extractionStatus}:{" "}
                        {tableMeta?.extractionDetails}
                    </p>
                </CardFooter>
            </Card>

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
                                    onValueChange={(
                                        value:
                                            | "string"
                                            | "integer"
                                            | "float"
                                            | "date"
                                    ) =>
                                        handleColumnTypeChange(
                                            column.name,
                                            value
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
                                        onValueChange={(
                                            value:
                                                | "MM/DD/YYYY"
                                                | "DD/MM/YYYY"
                                                | "MM-DD-YYYY"
                                                | "DD-MM-YYYY"
                                        ) =>
                                            handleColumnFormatChange(
                                                column.name,
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
