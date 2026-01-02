import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { GoogleCalendarSettings } from "./settings";

export interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	location?: string;
	description?: string;
	isAllDay: boolean;
}

export class GoogleCalendarAPI {
	private oauth2Client: OAuth2Client;
	private calendar: calendar_v3.Calendar;

	constructor(
		private settings: GoogleCalendarSettings,
		private saveSettings: () => Promise<void>
	) {
		this.oauth2Client = new google.auth.OAuth2(
			settings.clientId,
			settings.clientSecret,
			"http://localhost:8080/callback"
		);

		this.oauth2Client.setCredentials({
			access_token: settings.accessToken,
			refresh_token: settings.refreshToken,
			expiry_date: settings.tokenExpiry,
		});

		// Set up automatic token refresh
		this.oauth2Client.on("tokens", async (tokens) => {
			if (tokens.access_token) {
				this.settings.accessToken = tokens.access_token;
			}
			if (tokens.refresh_token) {
				this.settings.refreshToken = tokens.refresh_token;
			}
			if (tokens.expiry_date) {
				this.settings.tokenExpiry = tokens.expiry_date;
			}
			await this.saveSettings();
		});

		this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
	}

	async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return this.getEventsForRange(startOfDay, endOfDay);
	}

	async getEventsForRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
		try {
			const response = await this.calendar.events.list({
				calendarId: "primary",
				timeMin: startDate.toISOString(),
				timeMax: endDate.toISOString(),
				singleEvents: true,
				orderBy: "startTime",
			});

			const events = response.data.items || [];

			return events.map((event) => this.parseEvent(event));
		} catch (error) {
			console.error("Error fetching calendar events:", error);
			throw new Error("Failed to fetch calendar events. Please re-authenticate.");
		}
	}

	private parseEvent(event: calendar_v3.Schema$Event): CalendarEvent {
		const isAllDay = !event.start?.dateTime;

		const start = isAllDay
			? new Date(event.start!.date!)
			: new Date(event.start!.dateTime!);

		const end = isAllDay
			? new Date(event.end!.date!)
			: new Date(event.end!.dateTime!);

		return {
			id: event.id!,
			title: event.summary || "(No title)",
			start,
			end,
			location: event.location || undefined,
			description: event.description || undefined,
			isAllDay,
		};
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.calendar.calendarList.list();
			return true;
		} catch (error) {
			return false;
		}
	}
}
