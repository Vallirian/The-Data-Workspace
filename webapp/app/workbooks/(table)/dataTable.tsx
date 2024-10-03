"use client";
import { UploadCSVProps } from "@/interfaces/props";
import { SetStateAction, useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { space } from "postcss/lib/list";
import { ScrollArea } from "@radix-ui/react-scroll-area";

// Sample data
const initialData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Manager" },
    {
        id: 5,
        name: "Charlie Davis",
        email: "charlie@example.com",
        role: "User",
    },
    { id: 6, name: "Eva Wilson", email: "eva@example.com", role: "Admin" },
    { id: 7, name: "Frank Miller", email: "frank@example.com", role: "User" },
    { id: 8, name: "Grace Lee", email: "grace@example.com", role: "Manager" },
    { id: 9, name: "Henry Taylor", email: "henry@example.com", role: "User" },
    { id: 10, name: "Ivy Clark", email: "ivy@example.com", role: "Admin" },
    { id: 11, name: "Jack Robinson", email: "jack@example.com", role: "User" },
    {
        id: 12,
        name: "Karen White",
        email: "karen@example.com",
        role: "Manager",
    },
    { id: 13, name: "Liam Harris", email: "liam@example.com", role: "User" },
    { id: 14, name: "Mia Turner", email: "mia@example.com", role: "Admin" },
    { id: 15, name: "Noah Martin", email: "noah@example.com", role: "User" },
];

export default function ArcDataTable({ workbookId, tableId }: UploadCSVProps) {
    const [data, setData] = useState(initialData);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [filterValue, setFilterValue] = useState("");

    // Sorting function
    const sortData = (column: SetStateAction<string>) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Filtering function
    const filterData = (data: any[]) => {
        return data.filter(
            (item) =>
                item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.email.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.role.toLowerCase().includes(filterValue.toLowerCase())
        );
    };

    // Apply sorting and filtering
    const sortedAndFilteredData = filterData([...data]).sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
            return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
            return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
    const paginatedData = sortedAndFilteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h1 className="text-2xl font-bold">Full-Screen Data Table</h1>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter..."
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="w-64"
                    />
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) =>
                            setItemsPerPage(Number(value))
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 per page</SelectItem>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="w-[100px]"
                                        onClick={() => sortData("id")}
                                    >
                                        ID{" "}
                                        {sortColumn === "id" &&
                                            (sortDirection === "asc"
                                                ? "↑"
                                                : "↓")}
                                    </TableHead>
                                    <TableHead onClick={() => sortData("name")}>
                                        Name{" "}
                                        {sortColumn === "name" &&
                                            (sortDirection === "asc"
                                                ? "↑"
                                                : "↓")}
                                    </TableHead>
                                    <TableHead
                                        onClick={() => sortData("email")}
                                    >
                                        Email{" "}
                                        {sortColumn === "email" &&
                                            (sortDirection === "asc"
                                                ? "↑"
                                                : "↓")}
                                    </TableHead>
                                    <TableHead onClick={() => sortData("role")}>
                                        Role{" "}
                                        {sortColumn === "role" &&
                                            (sortDirection === "asc"
                                                ? "↑"
                                                : "↓")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.id}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.role}</TableCell>
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
