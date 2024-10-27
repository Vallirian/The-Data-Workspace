"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

export default function ArcTable({ data, x, name, description }: { data: any[]; x: string; name: string; description: string }) {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumn, setSortColumn] = useState(x);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const rowsPerPage = 10;

	const columns = Object.keys(data[0]).map((key) => ({
		id: key,
		name: key,
	}));

	// make x the first column
	const xIndex = columns.findIndex((column) => column.name === x);
	columns.splice(xIndex, 1);
	columns.unshift({ id: x, name: x });

	const sortedData = [...data].sort((a, b) => {
		if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
		if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const totalPages = Math.ceil(sortedData.length / rowsPerPage);

	const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handleSort = (columnName: string) => {
		if (sortColumn === columnName) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(columnName);
			setSortDirection("asc");
		}
	};

	return (
		<div className="w-full">
			<h5 className="mb-2 font-semibold">{name}</h5>
			<p className="mb-2 line-clamp-2">{description}</p>
			<div className="overflow-auto">
				<ScrollArea className="h-full">
					<div className="p-4">
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((column) => (
										<TableHead className="cursor-pointer" key={column.id} onClick={() => handleSort(column.name)}>
											<div className="flex items-center">
												{column.name}
												{sortColumn === column.name && (sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.map((item, rowIndex) => (
									<TableRow key={rowIndex}>
										{columns.map((column) => (
											<TableCell key={`${rowIndex}${column.id}`}>{item[column.name]}</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</ScrollArea>
			</div>
			<div className="flex justify-between items-center mt-4">
				<div>
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
