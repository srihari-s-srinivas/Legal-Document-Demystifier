// A simple utility to generate .ics file content for calendar events.

// Attempts to parse various date formats that the AI might return.
const robustDateParse = (dateString: string): Date | null => {
    // Check for YYYY-MM-DD format first
    const ymdMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        const d = new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}T12:00:00Z`); // Use noon UTC to avoid timezone issues
        if (!isNaN(d.getTime())) return d;
    }

    // Try standard Date.parse for other formats like "January 1, 2025"
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d;
    
    return null;
};

// Generates a random UID for the calendar event.
const generateUid = () => {
    return 'uid-' + Math.random().toString(36).substr(2, 9) + '@legal-demystifier.app';
};

// Formats a Date object into the required iCalendar format (YYYYMMDD).
const formatDateForIcs = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
};

interface CalendarEvent {
    summary: string;
    description: string;
    dateString: string; // The original date string from the AI
}

export const createIcsFileContent = (events: CalendarEvent[]): string => {
    const validEvents = events
        .map(e => ({ ...e, dtstart: robustDateParse(e.dateString) }))
        .filter(e => e.dtstart !== null) as { summary: string; description: string; dtstart: Date }[];
    
    if (validEvents.length === 0) {
        alert("No valid, specific dates could be found to export to the calendar.");
        return "";
    }
    
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

    let icsString = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LegalDemystifier//Contract Reminders v1.0//EN',
        'CALSCALE:GREGORIAN',
    ];

    validEvents.forEach(event => {
        icsString.push('BEGIN:VEVENT');
        icsString.push(`UID:${generateUid()}`);
        icsString.push(`DTSTAMP:${timestamp}Z`);
        icsString.push(`DTSTART;VALUE=DATE:${formatDateForIcs(event.dtstart)}`);
        // All-day event, so DTEND is the next day
        const dtend = new Date(event.dtstart);
        dtend.setUTCDate(dtend.getUTCDate() + 1);
        icsString.push(`DTEND;VALUE=DATE:${formatDateForIcs(dtend)}`);
        // Escape characters in summary and description
        const summary = event.summary.replace(/,/g, '\\,').replace(/;/g, '\\;');
        const description = event.description.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
        icsString.push(`SUMMARY:${summary}`);
        icsString.push(`DESCRIPTION:${description}`);
        icsString.push('END:VEVENT');
    });

    icsString.push('END:VCALENDAR');

    return icsString.join('\r\n');
};
