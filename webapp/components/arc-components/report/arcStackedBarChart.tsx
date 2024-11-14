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
    x
}: {
    data: {[key: string]: any}[];
    x: string;
}) {
    if (!data || data.length === 0) {
        return <div>No data</div>;
    }

    const dataKeys = Object.keys(data[0]).filter((key) => key !== x);
    const categories = dataKeys.filter((key) => key !== x);
    const chartConfig = buildInitialConfig(categories);

    return (
        <div className="w-full h-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
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
                    <ChartTooltip content={<ChartTooltipContent  />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {categories.map((category) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            fill={chartConfig[category].color}
                            radius={4}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </div>
    );
}
