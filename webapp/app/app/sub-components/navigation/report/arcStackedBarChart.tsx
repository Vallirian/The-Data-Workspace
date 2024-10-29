"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { buildInitialConfig, formatXAxisTick } from "@/services/chartServices";

export default function ArcStackedBarChart({
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
    if (!data || data.length === 0) {
        return <div>No data</div>;
    }

    const dataKeys = Object.keys(data[0]).filter((key) => key !== x);
    const categories = dataKeys.filter((key) => key !== x);
    const chartConfig = buildInitialConfig(categories);

    return (
        <div className="w-full">
            <h5 className="mb-2 font-semibold">{name}</h5>
            <p className="mb-2 line-clamp-2">{description}</p>
            <ChartContainer config={chartConfig}>
                <BarChart
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
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={formatXAxisTick}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {categories.map((category) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            fill={`var(--color-${category})`}
                            radius={4}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </div>
    );
}
