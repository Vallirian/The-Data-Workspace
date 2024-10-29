export function ArcAutoFormat(input: any): string | number {
    try {
        if (!isNaN(input)) {
            return Number(input).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            }); // Round to 3 decimal places and add comma separation
        }

        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const fullDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

        if (isoDateRegex.test(input) || fullDateRegex.test(input)) {
            const date = new Date(input);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString(); // Convert Date to string here
            }
        }

        return String(input);
    } catch (error) {
        return String(input);
    }
}
