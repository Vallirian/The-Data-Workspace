"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { UploadCSVProps } from "@/interfaces/props";
import { SetStateAction, use, useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit2,
    Save,
} from "lucide-react";
import { space } from "postcss/lib/list";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import axiosInstance from "@/services/axios";
import { set } from "date-fns";
import {
    DataTableColumnMetaInterface,
    DataTableMetaInterface,
} from "@/interfaces/main";

export default function ArcDataTable({ workbookId, tableId }: UploadCSVProps) {
    const { toast } = useToast();

    const [data, setData] = useState([]);
    const [tableMeta, setTableMeta] = useState<DataTableMetaInterface | null>(
        null
    );
    const [columns, setColumns] = useState<DataTableColumnMetaInterface[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [filterValue, setFilterValue] = useState("");

    // data tools
    useEffect(() => {
        getTableMeta();
        getTableMetaColumns();
    }, [workbookId, tableId]);

    const getData = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/raw/`
            );

            setData(response.data.items);
            setCurrentPage(response.data.currentPage);
            setItemsPerPage(response.data.pageSize);
            setTotalPages(
                Math.ceil(
                    response.data.totalItemsCount / response.data.pageSize
                )
            );
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error getting data",
                description: "Failed to fetch data",
                action: (
                    <ToastAction altText="Ok" onClick={getData}>
                        Ok
                    </ToastAction>
                ),
            });
        }
    };

    const getTableMeta = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/`
            );

            setTableMeta(response.data);
            setTableDescription(response.data.description);

            if (response.data.dataSourceAdded) {
                /*
                    added here because we need to wait for the table meta to be fetched
                    and its hard to perfect the async timing in useEffect
                */
                getData();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error getting table meta",
                description: "Failed to fetch table meta",
                action: (
                    <ToastAction altText="Ok" onClick={getTableMeta}>
                        Ok
                    </ToastAction>
                ),
            });
        }
    };

    const getTableMetaColumns = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/columns/`
            );
            setColumns(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error getting table meta columns",
                description: "Failed to fetch table meta columns",
                action: (
                    <ToastAction altText="Ok" onClick={getTableMetaColumns}>
                        Ok
                    </ToastAction>
                ),
            });
        }
    };

    // Table tools
    const sortData = (column: SetStateAction<string>) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const filterData = (data: any[]) => {
        return data.filter((item) =>
            columns.some((column) =>
                String(item[column.name])
                    .toLowerCase()
                    .includes(filterValue.toLowerCase())
            )
        );
    };

    const sortedAndFilteredData = filterData([...data]).sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
            return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
            return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const paginatedData = sortedAndFilteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const [tableDescription, setTableDescription] = useState(
        "Add table description"
    );
    const [editingTableDescription, setEditingTableDescription] =
        useState(false);
    const [editingColumnDescription, setEditingColumnDescription] =
        useState("");
    const tableDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const columnDescriptionRefs = useRef<{
        [key: string]: HTMLTextAreaElement | null;
    }>({});

    useEffect(() => {
        if (editingTableDescription && tableDescriptionRef.current) {
            tableDescriptionRef.current.focus();
        }
    }, [editingTableDescription]);

    useEffect(() => {
        if (
            editingColumnDescription &&
            columnDescriptionRefs.current[editingColumnDescription]
        ) {
            columnDescriptionRefs.current[editingColumnDescription]?.focus();
        }
    }, [editingColumnDescription]);

    const putTableMeta = async (updatedMeta: DataTableMetaInterface) => {
        try {
            await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/`,
                updatedMeta // Send the updated tableMeta
            );

            toast({
                title: "Table description saved",
                description: "Table description updated successfully.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error saving table description",
                description: "Failed to save table description",
                action: (
                    <ToastAction
                        altText="Ok"
                        onClick={() => putTableMeta(updatedMeta)}
                    >
                        Ok
                    </ToastAction>
                ),
            });
        }
    };

    const handleTableDescriptionSave = () => {
        if (tableDescriptionRef.current) {
            const newDescription = tableDescriptionRef.current.value;

            // Update tableMeta with new description
            setTableMeta((prev) => {
                if (!prev) return prev;
                const updatedMeta = {
                    ...prev,
                    description: newDescription,
                };
                putTableMeta(updatedMeta); // Call putTableMeta directly with updated meta
                return updatedMeta; // Return the updated meta state
            });

            // Update the table description state
            setTableDescription(newDescription);

            // Stop editing the table description
            setEditingTableDescription(false);
        }
    };

    const putColumnMeta = async (column: DataTableColumnMetaInterface) => {
        try {
            await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/datatable/${tableId}/columns/${column.id}/`,
                column // Send the updated column directly
            );

            toast({
                title: "Column description saved",
                description: "Column description saved successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error saving column description",
                description: "Failed to save column description",
                action: (
                    <ToastAction
                        altText="Ok"
                        onClick={() => putColumnMeta(column)}
                    >
                        Ok
                    </ToastAction>
                ),
            });
        }
    };

    const handleColumnDescriptionSave = (columnKey: string) => {
        if (columnDescriptionRefs.current[columnKey]) {
            const newDescription =
                columnDescriptionRefs.current[columnKey]?.value;

            // Update the columns state using a callback to ensure the updated state is available
            setColumns((prevColumns) => {
                const updatedColumns = prevColumns.map((col) =>
                    col.id === columnKey
                        ? {
                              ...col,
                              description: newDescription || col.description,
                          }
                        : col
                );

                // Call putColumnMeta with the updated column
                const updatedColumn = updatedColumns.find(
                    (col) => col.id === columnKey
                );
                if (updatedColumn) {
                    putColumnMeta(updatedColumn); // Pass the updated column directly
                }

                return updatedColumns; // Return the new state
            });

            // Stop editing the column description
            setEditingColumnDescription("");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <Toaster />
            <div className="flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">
                    {tableMeta?.name || "Untitled Table"}
                </h1>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter..."
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="w-64"
                    />
                </div>
            </div>
            <div className="p-4 text-sm text-gray-500  border-b">
                {editingTableDescription ? (
                    <div className="flex items-center">
                        <textarea
                            ref={tableDescriptionRef}
                            defaultValue={tableDescription}
                            className="w-full p-2 border rounded-md"
                            rows={2}
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleTableDescriptionSave}
                            className="ml-2"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <span>{tableDescription}</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTableDescription(true)}
                            className="ml-2"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-auto">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead
                                            className="cursor-pointer"
                                            key={column.id}
                                            onClick={() =>
                                                sortData(column.name)
                                            }
                                        >
                                            <div>{column.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {editingColumnDescription ===
                                                column.id ? (
                                                    <div className="flex items-center">
                                                        <textarea
                                                            ref={(el) => {
                                                                columnDescriptionRefs.current[
                                                                    column.id
                                                                ] = el;
                                                            }}
                                                            defaultValue={
                                                                column.description
                                                            }
                                                            className="p-1 border rounded-md"
                                                            rows={2}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleColumnDescriptionSave(
                                                                    column.id
                                                                );
                                                            }}
                                                            className="ml-1"
                                                        >
                                                            <Save className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <span>
                                                            {column.description ||
                                                                "Add column description"}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingColumnDescription(
                                                                    column.id
                                                                );
                                                            }}
                                                            className="ml-1"
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {sortColumn === column.id && (
                                                <span className="ml-1">
                                                    {sortDirection === "asc"
                                                        ? "↑"
                                                        : "↓"}
                                                </span>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={`${rowIndex}${column.id}`}
                                            >
                                                {item[column.name]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollArea>
            </div>
            <div className="flex-shrink-0 p-4 border-t">
                <div className="flex justify-between items-center px-4">
                    <div>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                            currentPage * itemsPerPage,
                            sortedAndFilteredData.length
                        )}{" "}
                        of {sortedAndFilteredData.length} entries
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
