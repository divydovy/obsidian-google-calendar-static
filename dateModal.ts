import { App, Modal, Setting } from "obsidian";

export class DateInputModal extends Modal {
	result: Date | null = null;
	onSubmit: (date: Date) => void;

	constructor(app: App, onSubmit: (date: Date) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Select date for calendar events" });

		const today = new Date();
		const todayStr = this.formatDateForInput(today);

		new Setting(contentEl)
			.setName("Date")
			.setDesc("Select which date to fetch events for")
			.addText((text) => {
				text.inputEl.type = "date";
				text.inputEl.value = todayStr;
				text.onChange((value) => {
					this.result = new Date(value);
				});
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Today")
					.onClick(() => {
						this.result = new Date();
						this.close();
						this.onSubmit(this.result);
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Cancel")
					.onClick(() => {
						this.close();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Insert")
					.setCta()
					.onClick(() => {
						if (this.result) {
							this.close();
							this.onSubmit(this.result);
						}
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private formatDateForInput(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
}
