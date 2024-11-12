"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { buildInitialConfig, formatXAxisTick } from "@/services/chartServices";

export function ArcLineChart({ data, x }: { data: { [key: string]: any }[]; x: string }) {
	if (!data || data.length === 0) {
		return <div>No data</div>;
	}

	const dataKeys = Object.keys(data[0]).filter((key) => key !== x);
	const categories = dataKeys.filter((key) => key !== x);
	const chartConfig = buildInitialConfig(categories);

	return (
		<div className="w-full h-full flex flex-col">
			<ChartContainer config={chartConfig} className="h-full w-full">
				<LineChart
					accessibilityLayer
					data={data}
					margin={{
						left: 36,
						right: 36,
					}}
				>
					<CartesianGrid vertical={false} />
					<XAxis dataKey={x} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatXAxisTick} />
					<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
					<ChartLegend content={<ChartLegendContent />} />
					{categories.map((category) => (
						<Line key={category} dataKey={category} type="linear" stroke={`var(--color-${category})`} strokeWidth={2} dot={false} height={100} />
					))}
				</LineChart>
			</ChartContainer>
		</div>
	);
}
