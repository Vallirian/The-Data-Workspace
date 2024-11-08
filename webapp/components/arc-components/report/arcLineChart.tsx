"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { buildInitialConfig, formatXAxisTick } from "@/services/chartServices";

export function ArcLineChart({
    data,
    x,
    name,
    description,
}: {
    data: {[key: string]: any}[];
    x: string;
    name: string;
    description: string;
}) {
    if (!data || data.length === 0) {
        return <div>No data</div>;
    }

    const dataKeys = Object.keys(data[0]).filter((key) => key !== x);
    const categories = dataKeys.filter((key) => key !== x);
    const chartConfig = buildInitialConfig(categories);

    return (
        <div className="">
            <h5 className="mb-2 font-semibold">{name}</h5>
            <p className="mb-2 line-clamp-2">{description}</p>
            <ChartContainer config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 36,
                        right: 36,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey={x}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={formatXAxisTick}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {categories.map((category) => (
                        <Line
                            key={category}
                            dataKey={category}
                            type="linear"
                            stroke={`var(--color-${category})`}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ChartContainer>
        </div>
    );
}
