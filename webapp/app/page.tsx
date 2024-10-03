"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as React from "react";
import { Progress } from "@/components/ui/progress";

export default function Home() {
    const [progress, setProgress] = React.useState(13);
    const router = useRouter();

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        router.push("/workbooks"); 
    }, []);

    return <Progress value={progress} className="w-[60%]" />;
}
