"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { UploadCSVProps } from "@/interfaces/props";
import { SetStateAction, useEffect, useState } from "react";
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
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/raw/`
            );

            setData(response.data.items);
            setCurrentPage(response.data.currentPage);
            setItemsPerPage(response.data.pageSize);
            setTotalPages(Math.ceil(response.data.totalItemsCount / response.data.pageSize));
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
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/`
            );

            setTableMeta(response.data);

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
                `${process.env.NEXT_PUBLIC_API_URL}/table-meta/${workbookId}/${tableId}/columns/`
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

    return (
        <div className="flex flex-col h-full">
            <Toaster />
            <div className="flex justify-between items-center p-4 border-b">
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
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.id}
                                            onClick={() =>
                                                sortData(column.name)
                                            }
                                        >
                                            {column.name}
                                            {sortColumn === column.name &&
                                                (sortDirection === "asc"
                                                    ? "↑"
                                                    : "↓")}
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
