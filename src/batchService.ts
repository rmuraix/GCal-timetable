/**
 * Batch service for Google Calendar API operations
 * Handles batch requests for creating and deleting calendar events
 */

interface BatchOperation {
	method: string;
	path: string;
	body?: string;
}

interface BatchConfig {
	maxBatchSize: number;
	maxRetries: number;
	initialBackoffMs: number;
}

const DEFAULT_BATCH_CONFIG: BatchConfig = {
	maxBatchSize: 500,
	maxRetries: 3,
	initialBackoffMs: 1000,
};

export class BatchService {
	private readonly calendarId: string;
	private readonly config: BatchConfig;
	private createOperations: BatchOperation[] = [];
	private deleteOperations: BatchOperation[] = [];

	constructor(calendarId: string, config: Partial<BatchConfig> = {}) {
		this.calendarId = calendarId;
		this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
	}

	/**
	 * Queue an event creation operation
	 */
	queueCreateEvent(
		title: string,
		startTime: Date,
		endTime: Date,
		description: string,
	): void {
		const event = {
			summary: title,
			description: description,
			start: {
				dateTime: startTime.toISOString(),
			},
			end: {
				dateTime: endTime.toISOString(),
			},
		};

		this.createOperations.push({
			method: "POST",
			path: `/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events`,
			body: JSON.stringify(event),
		});
	}

	/**
	 * Queue an event deletion operation
	 */
	queueDeleteEvent(eventId: string): void {
		this.deleteOperations.push({
			method: "DELETE",
			path: `/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events/${eventId}`,
		});
	}

	/**
	 * Execute all queued create operations in batches
	 */
	flushCreateOperations(): void {
		if (this.createOperations.length === 0) {
			return;
		}

		this.executeBatches(this.createOperations);
		this.createOperations = [];
	}

	/**
	 * Execute all queued delete operations in batches
	 */
	flushDeleteOperations(): void {
		if (this.deleteOperations.length === 0) {
			return;
		}

		this.executeBatches(this.deleteOperations);
		this.deleteOperations = [];
	}

	/**
	 * Execute operations in batches
	 */
	private executeBatches(operations: BatchOperation[]): void {
		const batches = this.splitIntoBatches(operations);

		for (const batch of batches) {
			this.executeBatchWithRetry(batch);
		}
	}

	/**
	 * Split operations into batches of maxBatchSize
	 */
	private splitIntoBatches(operations: BatchOperation[]): BatchOperation[][] {
		const batches: BatchOperation[][] = [];

		for (let i = 0; i < operations.length; i += this.config.maxBatchSize) {
			batches.push(operations.slice(i, i + this.config.maxBatchSize));
		}

		return batches;
	}

	/**
	 * Execute a single batch with retry logic
	 */
	private executeBatchWithRetry(operations: BatchOperation[]): void {
		let attempt = 0;
		let lastError: Error | null = null;

		while (attempt < this.config.maxRetries) {
			try {
				this.executeBatch(operations);
				return;
			} catch (error) {
				lastError = error as Error;
				attempt++;

				if (attempt < this.config.maxRetries) {
					const backoffMs = this.config.initialBackoffMs * 2 ** (attempt - 1);
					Logger.log(
						`Batch request failed (attempt ${attempt}/${this.config.maxRetries}). Retrying in ${backoffMs}ms...`,
					);
					Utilities.sleep(backoffMs);
				}
			}
		}

		Logger.log(
			`Batch request failed after ${this.config.maxRetries} attempts: ${lastError?.message}`,
		);
		throw lastError;
	}

	/**
	 * Execute a single batch request
	 */
	private executeBatch(operations: BatchOperation[]): void {
		const boundary = `batch_${Utilities.getUuid()}`;
		const payload = this.buildBatchPayload(operations, boundary);

		const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
			method: "post",
			contentType: `multipart/mixed; boundary=${boundary}`,
			headers: {
				Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
			},
			payload: payload,
			muteHttpExceptions: true,
		};

		const response = UrlFetchApp.fetch(
			"https://www.googleapis.com/batch/calendar/v3",
			options,
		);

		const responseCode = response.getResponseCode();

		// Check for rate limiting or server errors
		if (responseCode === 429 || responseCode >= 500) {
			throw new Error(`HTTP ${responseCode}: ${response.getContentText()}`);
		}

		// Check for client errors
		if (responseCode >= 400) {
			Logger.log(`Batch request failed: ${response.getContentText()}`);
			throw new Error(`HTTP ${responseCode}: ${response.getContentText()}`);
		}

		// Parse and log any individual operation failures
		this.parseAndLogBatchResponse(response.getContentText());
	}

	/**
	 * Build multipart/mixed payload for batch request
	 */
	private buildBatchPayload(
		operations: BatchOperation[],
		boundary: string,
	): string {
		const parts: string[] = [];

		// Content-ID starts from 1 (not 0) as per Google API batch request specification
		for (const [i, operation] of operations.entries()) {
			let part = `--${boundary}\r\n`;
			part += "Content-Type: application/http\r\n";
			part += `Content-ID: ${i + 1}\r\n\r\n`;
			part += `${operation.method} ${operation.path} HTTP/1.1\r\n`;

			if (operation.body) {
				part += "Content-Type: application/json\r\n\r\n";
				part += `${operation.body}\r\n`;
			} else {
				part += "\r\n";
			}

			parts.push(part);
		}

		parts.push(`--${boundary}--\r\n`);

		return parts.join("");
	}

	/**
	 * Parse batch response and log any errors
	 */
	private parseAndLogBatchResponse(responseText: string): void {
		// Simple parsing to detect errors in batch responses
		// Each response part starts with HTTP/1.1 status code
		const statusPattern = /HTTP\/1\.1 (\d+)/g;
		let errorCount = 0;

		let match: RegExpExecArray | null = statusPattern.exec(responseText);
		while (match !== null) {
			const statusCode = Number.parseInt(match[1], 10);
			if (statusCode >= 400) {
				errorCount++;
			}
			match = statusPattern.exec(responseText);
		}

		if (errorCount > 0) {
			Logger.log(
				`Batch completed with ${errorCount} individual operation error(s)`,
			);
		}
	}

	/**
	 * Get the number of queued create operations
	 */
	getCreateOperationCount(): number {
		return this.createOperations.length;
	}

	/**
	 * Get the number of queued delete operations
	 */
	getDeleteOperationCount(): number {
		return this.deleteOperations.length;
	}
}
