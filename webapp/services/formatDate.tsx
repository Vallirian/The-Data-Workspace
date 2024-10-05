import { format } from 'date-fns'; // Utility for date formatting


const ArcFormatDate = (messageDate: Date) => {
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    // If the message is from today, show only the time, otherwise show full date and time
    return isToday
        ? format(messageDate, 'p') // Only time, e.g., "12:00 PM"
        : format(messageDate, 'MMM d, yy p'); // Full date, e.g., "Sep 12, 24 12:00 PM"
};

export default ArcFormatDate;