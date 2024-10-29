import { ChartConfig } from "@/components/ui/chart";

export const buildInitialConfig = (categories: string[]): ChartConfig => {
    const config: ChartConfig = {};

    categories.forEach((category, index) => {
        config[category] = {
            label: category.charAt(0).toUpperCase() + category.slice(1),
            color: `hsl(var(--chart-${(index + 2) % 5}))`,
        };
    });

    return config;
};

export const formatXAxisTick = (value: any) => {
    return value;
};
