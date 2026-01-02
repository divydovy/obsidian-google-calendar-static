import { CalendarEvent } from "./googleCalendar";
import { GoogleCalendarSettings } from "./settings";

export class EventFormatter {
	constructor(private settings: GoogleCalendarSettings) {}

	formatEvents(events: CalendarEvent[]): string {
		if (events.length === 0) {
			return "No events scheduled for this day.";
		}

		const lines: string[] = [];

		for (const event of events) {
			lines.push(this.formatEvent(event));
		}

		return lines.join("\n");
	}

	formatEventsGroupedByDay(events: CalendarEvent[], startDate?: Date, endDate?: Date): string {
		if (events.length === 0) {
			return "No events scheduled for this period.";
		}

		// Group events by date, handling ongoing events appropriately
		const eventsByDate = new Map<string, CalendarEvent[]>();

		for (const event of events) {
			const eventStartDate = event.start;
			const eventEndDate = event.end;

			// Handle ongoing events (started before range but extend into it)
			if (this.settings.includeOngoingEvents && startDate && eventStartDate < startDate && eventEndDate >= startDate) {
				// Show ongoing events on the first day of the requested range
				const dateKey = this.getDateKey(startDate);
				if (!eventsByDate.has(dateKey)) {
					eventsByDate.set(dateKey, []);
				}
				eventsByDate.get(dateKey)!.push(event);
				continue;
			}

			// Skip events that start before the requested range (if not ongoing)
			if (startDate && eventStartDate < startDate) {
				continue;
			}

			// Skip events that start after the requested range
			if (endDate && eventStartDate > endDate) {
				continue;
			}

			const dateKey = this.getDateKey(eventStartDate);
			if (!eventsByDate.has(dateKey)) {
				eventsByDate.set(dateKey, []);
			}
			eventsByDate.get(dateKey)!.push(event);
		}

		// Format each day
		const lines: string[] = [];
		const sortedDates = Array.from(eventsByDate.keys()).sort();

		for (const dateKey of sortedDates) {
			const dayEvents = eventsByDate.get(dateKey)!;
			const date = new Date(dateKey);

			lines.push(`### ${this.formatDateString(date)}`);
			lines.push("");

			for (const event of dayEvents) {
				// Check if this is an ongoing event (started before the range)
				const isOngoing = startDate && event.start < startDate;
				lines.push(this.formatEvent(event, isOngoing));
			}

			lines.push("");
		}

		return lines.join("\n");
	}

	private getDateKey(date: Date): string {
		return `${date.getFullYear()}-${(date.getMonth() + 1)
			.toString()
			.padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
	}

	private formatDateString(date: Date): string {
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const dayName = days[date.getDay()];
		const monthName = months[date.getMonth()];
		const day = date.getDate();
		const year = date.getFullYear();

		return `${dayName}, ${monthName} ${day}, ${year}`;
	}

	private formatEvent(event: CalendarEvent, isOngoing: boolean = false): string {
		const time = this.formatTime(event);
		const title = event.title;
		const ongoingIndicator = isOngoing ? " (ongoing)" : "";
		const location = this.settings.includeLocation && event.location
			? ` (${event.location})`
			: "";
		const description = this.settings.includeDescription && event.description
			? `\n  ${event.description}`
			: "";

		return `- ${time}: ${title}${ongoingIndicator}${location}${description}`;
	}

	private formatTime(event: CalendarEvent): string {
		if (event.isAllDay) {
			return "All day";
		}

		const startTime = this.formatTimeString(event.start);
		const endTime = this.formatTimeString(event.end);

		return `${startTime} - ${endTime}`;
	}

	private formatTimeString(date: Date): string {
		const hours = date.getHours();
		const minutes = date.getMinutes();

		if (this.settings.timeFormat === "24h") {
			return `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}`;
		} else {
			// 12-hour format
			const period = hours >= 12 ? "PM" : "AM";
			const hour12 = hours % 12 || 12;
			return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
		}
	}

	formatDateHeader(date: Date): string {
		return `## Calendar Events`;
	}
}
