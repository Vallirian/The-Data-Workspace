"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function ArcStackedBarChart({
  data,
  x,
  name,
  description,
}: {
  data: any[]
  x: string
  name: string
  description: string
}) {
  if (!data || data.length === 0) {
    console.log("No data")
    return <div>No data</div>
  }

  const dataKeys = Object.keys(data[0]).filter((key) => key !== x)
  const categories = dataKeys.filter((key) => key !== x)

  const buildInitialConfig = (categories: string[]): ChartConfig => {
    const config: ChartConfig = {}

    categories.forEach((category, index) => {
        console.log(category, index)
      config[category] = {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        color: `hsl(var(--chart-${(index + 2) % 5}))`,
      }
    })

    return config
  }

  const chartConfig = buildInitialConfig(categories)

  const formatXAxisTick = (value: any) => {
    if (typeof value === 'string') {
      return value.slice(0, 3)
    }
    if (typeof value === 'number') {
      return value.toString().slice(0, 3)
    }
    if (value instanceof Date) {
      return value.toLocaleDateString(undefined, { month: 'short' })
    }
    return String(value).slice(0, 3)
  }

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
              tickFormatter={formatXAxisTick}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />
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
      </CardContent>
    </Card>
  )
}