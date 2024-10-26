"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export default function ArcStackedBarChart({
    data,
    x,
    name,
    description,
}: {
    data: any;
    x: string;
    name: string;
    description: string;
}) {
    if (!data || data.length === 0) {
        console.log("No data");
        return <div>No data</div>;
    }

    const dataKeys = Object.keys(data[0]).filter((key) => key !== x);
    const categories = dataKeys.filter((key) => key !== x);

    const buildInitialConfig = (categories: string[]): ChartConfig => {
        const config: ChartConfig = {};

        // Initialize dynamic categories; index is offset by static categories size
        categories.forEach((category, index) => {
            config[category] = {
                label: category.charAt(0).toUpperCase() + category.slice(1),
                color: `hsl(var(--chart-${(index + 2) % 5}))`, // Use dynamic color, +2 to have a better theme
            };
        });

        return config;
    };

    const chartConfig = buildInitialConfig(categories);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={x}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        {categories.map((category) => (
                            <Bar
                                dataKey={category}
                                fill={`var(--color-${category})`}
                                radius={4}
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
