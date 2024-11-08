"use client";

import ArcAvatar from "./arcAvatar";
import ArcBreadcrumb from "./arcBreadcrumb";

export default function ArcNavbar() {
    return (
        <nav className="p-4 flex justify-between items-center">
            <ArcBreadcrumb />
        </nav>
    );
}
