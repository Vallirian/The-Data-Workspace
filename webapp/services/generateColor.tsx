function getRandomWithinRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function generateRandomHSLColor(): string {
    const hue = getRandomWithinRange(0, 360); // Random hue from 0 to 360
    const saturation = getRandomWithinRange(60, 80); // Saturation from 60% to 80%
    const lightness = getRandomWithinRange(45, 60); // Lightness from 45% to 60%

    return `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}