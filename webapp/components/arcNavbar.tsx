"use client";

import { usePathname } from "next/navigation"; // Import usePathname
import ArcAvatar from "@/components/navigation/arcAvatar";
import ArcBreadcrumb from "./navigation/arcBreadcrumb";


export default function ArcNavbar() {

    const pathname = usePathname(); // Get the current path
    const pathSegments = pathname.split("/").filter((segment) => segment);

    return (
        <nav className="p-4 flex justify-between items-center">
            <ArcBreadcrumb />
            <ArcAvatar />
        </nav>
    );
}
