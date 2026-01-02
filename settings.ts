import { App, PluginSettingTab, Setting } from "obsidian";
import GoogleCalendarStaticPlugin from "./main";

export interface GoogleCalendarSettings {
	clientId: string;
	clientSecret: string;
	accessToken: string;
	refreshToken: string;
	tokenExpiry: number;
	autoInsertDailyNotes: boolean;
	eventFormat: string;
	includeLocation: boolean;
	includeDescription: boolean;
	timeFormat: "12h" | "24h";
	includeOngoingEvents: boolean;
}

export const DEFAULT_SETTINGS: GoogleCalendarSettings = {
	clientId: "",
	clientSecret: "",
	accessToken: "",
	refreshToken: "",
	tokenExpiry: 0,
	autoInsertDailyNotes: false,
	eventFormat: "- {{time}}: {{title}}{{#if location}} ({{location}}){{/if}}",
	includeLocation: true,
	includeDescription: false,
	timeFormat: "12h",
	includeOngoingEvents: true,
};

export class GoogleCalendarSettingTab extends PluginSettingTab {
	plugin: GoogleCalendarStaticPlugin;

	constructor(app: App, plugin: GoogleCalendarStaticPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Google Calendar Static Settings" });

		// Authentication Section
		containerEl.createEl("h3", { text: "Authentication" });

		containerEl.createEl("p", {
			text: "To use this plugin, you need to create OAuth credentials in Google Cloud Console. ",
			cls: "setting-item-description"
		});

		const linkEl = containerEl.createEl("a", {
			text: "Follow this guide to set up credentials",
			href: "https://developers.google.com/workspace/calendar/api/quickstart/nodejs",
		});
		linkEl.setAttr("target", "_blank");

		new Setting(containerEl)
			.setName("Client ID")
			.setDesc("OAuth 2.0 Client ID from Google Cloud Console")
			.addText((text) =>
				text
					.setPlaceholder("Enter your client ID")
					.setValue(this.plugin.settings.clientId)
					.onChange(async (value) => {
						this.plugin.settings.clientId = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Client Secret")
			.setDesc("OAuth 2.0 Client Secret from Google Cloud Console")
			.addText((text) =>
				text
					.setPlaceholder("Enter your client secret")
					.setValue(this.plugin.settings.clientSecret)
					.onChange(async (value) => {
						this.plugin.settings.clientSecret = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Authenticate")
			.setDesc(
				this.plugin.settings.accessToken
					? "✅ Authenticated. Click to re-authenticate."
					: "Click to authenticate with Google Calendar"
			)
			.addButton((button) =>
				button
					.setButtonText("Authenticate")
					.onClick(async () => {
						await this.plugin.authenticate();
					})
			);

		if (this.plugin.settings.accessToken) {
			new Setting(containerEl)
				.setName("Clear tokens")
				.setDesc("Remove stored authentication tokens")
				.addButton((button) =>
					button
						.setButtonText("Clear")
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.accessToken = "";
							this.plugin.settings.refreshToken = "";
							this.plugin.settings.tokenExpiry = 0;
							await this.plugin.saveSettings();
							this.display();
						})
				);
		}

		// Formatting Section
		containerEl.createEl("h3", { text: "Event Formatting" });

		new Setting(containerEl)
			.setName("Time format")
			.setDesc("Choose 12-hour or 24-hour time format")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("12h", "12-hour (2:30 PM)")
					.addOption("24h", "24-hour (14:30)")
					.setValue(this.plugin.settings.timeFormat)
					.onChange(async (value: "12h" | "24h") => {
						this.plugin.settings.timeFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include location")
			.setDesc("Show event location in inserted text")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeLocation)
					.onChange(async (value) => {
						this.plugin.settings.includeLocation = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include description")
			.setDesc("Show event description in inserted text")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeDescription)
					.onChange(async (value) => {
						this.plugin.settings.includeDescription = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include ongoing events")
			.setDesc("Show multi-day events that started before but extend into the requested period (e.g., vacations that span multiple weeks)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeOngoingEvents)
					.onChange(async (value) => {
						this.plugin.settings.includeOngoingEvents = value;
						await this.plugin.saveSettings();
					})
			);

		// Daily Notes Integration
		containerEl.createEl("h3", { text: "Daily Notes Integration" });

		new Setting(containerEl)
			.setName("Auto-insert in daily notes")
			.setDesc("Automatically insert today's events when creating new daily notes (does not trigger when opening existing notes)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoInsertDailyNotes)
					.onChange(async (value) => {
						this.plugin.settings.autoInsertDailyNotes = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
