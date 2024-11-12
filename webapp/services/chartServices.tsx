import { ChartConfig } from "@/components/ui/chart";

export const getColorByIndex = (index: number): string => {
    // Base color: HSL(221, 83%, 53%)
    const baseHue = 221;
    const baseSaturation = 83;
    const baseLightness = 53;
    
    // Increase lightness by a certain amount for each index
    const lightness = Math.min(baseLightness + index * 5, 90); // Cap at 90% lightness to avoid overly light colors

    return `hsl(${baseHue}, ${baseSaturation}%, ${lightness}%)`;
}

export const buildInitialConfig = (categories: string[]): ChartConfig => {
    const config: ChartConfig = {};

    categories.forEach((category, index) => {
        config[category] = {
            label: category.charAt(0).toUpperCase() + category.slice(1),
            color: getColorByIndex(index),
        };
    });

    return config;
};

export const formatXAxisTick = (value: any) => {
    return value;
};
