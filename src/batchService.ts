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
					const backoffMs = this.config.initialBackoffMs * 2 ** attempt;
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
			part += "Host: www.googleapis.com\r\n";

			if (operation.body) {
				part += "Content-Type: application/json\r\n";
				part += `Content-Length: ${operation.body.length}\r\n\r\n`;
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
		// Parse batch responses to detect and log individual operation errors
		// Each response part starts with HTTP/1.1 status code
		const statusPattern = /HTTP\/1\.1 (\d+)/g;
		let errorCount = 0;
		const errors: string[] = [];

		for (const match of responseText.matchAll(statusPattern)) {
			const statusCode = parseInt(match[1], 10);
			if (statusCode >= 400) {
				errorCount++;
				// Try to extract JSON error body from the response
				const startIndex = match.index || 0;
				// Look for the JSON body after the headers (after the empty line)
				const responseSection = responseText.substring(
					startIndex,
					startIndex + 2000,
				);

				// Find the JSON object in the response body
				// It should be after headers (after \r\n\r\n or \n\n)
				const bodyStart = responseSection.search(/\r?\n\r?\n/);
				let errorMsg = "No error details available";

				if (bodyStart > 0) {
					const bodySection = responseSection.substring(bodyStart);
					// Try to find JSON object
					const jsonMatch = bodySection.match(
						/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/,
					);
					if (jsonMatch) {
						try {
							const errorObj = JSON.parse(jsonMatch[0]);
							if (errorObj.error?.message) {
								errorMsg = errorObj.error.message;
							} else if (errorObj.error) {
								errorMsg = JSON.stringify(errorObj.error);
							} else {
								errorMsg = JSON.stringify(errorObj);
							}
						} catch {
							// If JSON parsing fails, show raw response excerpt
							errorMsg = bodySection.substring(0, 200).trim();
						}
					} else {
						// No JSON found, show raw body excerpt
						errorMsg = bodySection.substring(0, 200).trim();
					}
				}

				errors.push(`HTTP ${statusCode}: ${errorMsg}`);
			}
		}

		if (errorCount > 0) {
			Logger.log(
				`Batch completed with ${errorCount} individual operation error(s)`,
			);
			// Log first few errors for debugging
			errors.slice(0, 3).forEach((error, index) => {
				Logger.log(`Error ${index + 1}: ${error}`);
			});
			if (errors.length > 3) {
				Logger.log(`... and ${errors.length - 3} more error(s)`);
			}

			// Add helpful context for common errors
			if (errors.some((e) => e.includes("HTTP 403"))) {
				Logger.log(
					"HTTP 403 errors indicate permission issues. Please verify:",
				);
				Logger.log("1. The calendar ID is correct");
				Logger.log("2. The script has calendar access permissions");
				Logger.log("3. The OAuth scopes include calendar permissions");
				Logger.log("4. You've authorized the script in Google Apps Script");
			}
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
