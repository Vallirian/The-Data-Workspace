"use client";

import { SetStateAction, use, useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function ArcTable({
    data,
    x,
    name,
    description,
}: {
    data: any[];
    x: string;
    name: string;
    description: string;
}) {
    const columns = Object.keys(data[0]).map((key) => ({
        id: key,
        name: key,
    }));

    // make x the first column
    const xIndex = columns.findIndex((column) => column.name === x);
    columns.splice(xIndex, 1);
    columns.unshift({ id: x, name: x });

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
                                        <TableHead
                                            className="cursor-pointer"
                                            key={column.id}
                                        >
                                            <div>{column.name}</div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, rowIndex) => (
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
        </div>
    );
}
