import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
} from "obsidian";

import {
	GoogleCalendarSettings,
	GoogleCalendarSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { OAuthServer } from "./oauthServer";
import { GoogleCalendarAPI } from "./googleCalendar";
import { EventFormatter } from "./formatter";
import { DateInputModal } from "./dateModal";

export default class GoogleCalendarStaticPlugin extends Plugin {
	settings: GoogleCalendarSettings;
	private oauthServer: OAuthServer;
	private calendarAPI: GoogleCalendarAPI | null = null;

	async onload() {
		await this.loadSettings();

		// Initialize OAuth server
		this.oauthServer = new OAuthServer();

		// Initialize Calendar API if we have tokens
		if (this.settings.accessToken) {
			this.initializeCalendarAPI();
		}

		// Command: Insert today's events
		this.addCommand({
			id: "insert-today-events",
			name: "Insert today's calendar events",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.insertEventsForDate(editor, new Date());
			},
		});

		// Command: Insert events for specific date
		this.addCommand({
			id: "insert-date-events",
			name: "Insert calendar events for specific date",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new DateInputModal(this.app, async (date) => {
					await this.insertEventsForDate(editor, date);
				}).open();
			},
		});

		// Command: Insert this week's events
		this.addCommand({
			id: "insert-week-events",
			name: "Insert this week's calendar events",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.insertEventsForWeek(editor, new Date());
			},
		});

		// Command: Insert this month's events
		this.addCommand({
			id: "insert-month-events",
			name: "Insert this month's calendar events",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await this.insertEventsForMonth(editor, new Date());
			},
		});

		// Add settings tab
		this.addSettingTab(new GoogleCalendarSettingTab(this.app, this));

		// Auto-insert for daily notes
		if (this.settings.autoInsertDailyNotes) {
			this.registerEvent(
				this.app.workspace.on("file-open", async (file) => {
					if (!file) return;

					// Check if this is a daily note
					const isDailyNote = this.isDailyNote(file.path);
					if (isDailyNote) {
						// Wait a moment for the file to be ready
						setTimeout(async () => {
							const view = this.app.workspace.getActiveViewOfType(MarkdownView);
							if (view) {
								const content = await this.app.vault.read(file);
								// Only auto-insert if content doesn't already have calendar events
								if (!content.includes("## Calendar Events")) {
									const editor = view.editor;
									// Position cursor at the end
									const lastLine = editor.lastLine();
									editor.setCursor(lastLine, 0);
									await this.insertEventsForDate(editor, new Date());
								}
							}
						}, 500);
					}
				})
			);
		}
	}

	onunload() {
		this.oauthServer?.cleanup();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async authenticate() {
		if (!this.settings.clientId || !this.settings.clientSecret) {
			new Notice("Please enter Client ID and Client Secret first");
			return;
		}

		try {
			new Notice("Opening browser for authentication...");

			const tokens = await this.oauthServer.startOAuthFlow({
				clientId: this.settings.clientId,
				clientSecret: this.settings.clientSecret,
			});

			this.settings.accessToken = tokens.access_token || "";
			this.settings.refreshToken = tokens.refresh_token || "";
			this.settings.tokenExpiry = tokens.expiry_date || 0;

			await this.saveSettings();
			this.initializeCalendarAPI();

			new Notice("✅ Successfully authenticated with Google Calendar!");
		} catch (error) {
			console.error("Authentication error:", error);
			new Notice("❌ Authentication failed. Check console for details.");
		}
	}

	private initializeCalendarAPI() {
		this.calendarAPI = new GoogleCalendarAPI(
			this.settings,
			this.saveSettings.bind(this)
		);
	}

	private async insertEventsForDate(editor: Editor, date: Date) {
		if (!this.calendarAPI) {
			new Notice("Please authenticate with Google Calendar first");
			return;
		}

		try {
			new Notice("Fetching calendar events...");

			const events = await this.calendarAPI.getEventsForDate(date);
			const formatter = new EventFormatter(this.settings);

			const header = formatter.formatDateHeader(date);
			const formattedEvents = formatter.formatEvents(events);

			const textToInsert = `\n${header}\n\n${formattedEvents}\n`;

			// Insert at cursor position
			editor.replaceSelection(textToInsert);

			new Notice(`✅ Inserted ${events.length} event(s)`);
		} catch (error) {
			console.error("Error inserting events:", error);
			new Notice("❌ Failed to fetch events. Please re-authenticate.");
		}
	}

	private async insertEventsForWeek(editor: Editor, date: Date) {
		if (!this.calendarAPI) {
			new Notice("Please authenticate with Google Calendar first");
			return;
		}

		try {
			new Notice("Fetching week's calendar events...");

			// Get start of week (Monday)
			const startOfWeek = new Date(date);
			const day = startOfWeek.getDay();
			const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
			startOfWeek.setDate(diff);
			startOfWeek.setHours(0, 0, 0, 0);

			// Get end of week (Sunday)
			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);

			const events = await this.calendarAPI.getEventsForRange(startOfWeek, endOfWeek);
			const formatter = new EventFormatter(this.settings);

			const header = `## This Week's Events`;
			const formattedEvents = formatter.formatEventsGroupedByDay(events, startOfWeek, endOfWeek);

			const textToInsert = `\n${header}\n\n${formattedEvents}\n`;

			editor.replaceSelection(textToInsert);

			new Notice(`✅ Inserted ${events.length} event(s) for this week`);
		} catch (error) {
			console.error("Error inserting week events:", error);
			new Notice("❌ Failed to fetch events. Please re-authenticate.");
		}
	}

	private async insertEventsForMonth(editor: Editor, date: Date) {
		if (!this.calendarAPI) {
			new Notice("Please authenticate with Google Calendar first");
			return;
		}

		try {
			new Notice("Fetching month's calendar events...");

			// Get start of month
			const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
			startOfMonth.setHours(0, 0, 0, 0);

			// Get end of month
			const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			endOfMonth.setHours(23, 59, 59, 999);

			const events = await this.calendarAPI.getEventsForRange(startOfMonth, endOfMonth);
			const formatter = new EventFormatter(this.settings);

			const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
			const header = `## ${monthName} Events`;
			const formattedEvents = formatter.formatEventsGroupedByDay(events, startOfMonth, endOfMonth);

			const textToInsert = `\n${header}\n\n${formattedEvents}\n`;

			editor.replaceSelection(textToInsert);

			new Notice(`✅ Inserted ${events.length} event(s) for ${monthName}`);
		} catch (error) {
			console.error("Error inserting month events:", error);
			new Notice("❌ Failed to fetch events. Please re-authenticate.");
		}
	}

	private isDailyNote(filePath: string): boolean {
		// Basic check - you might want to make this more sophisticated
		// by checking against Daily Notes plugin settings
		const fileName = filePath.split("/").pop()?.replace(".md", "") || "";

		// Check if filename STARTS WITH date pattern (YYYY-MM-DD)
		// This handles formats like "2025-01-02.md" or "2025-01-02 - Title.md"
		const datePattern = /^\d{4}-\d{2}-\d{2}(\s|$|-)/;
		return datePattern.test(fileName);
	}
}
