// Date Types - ISO-8601 Serialization Policy
// All dates in transport MUST be ISO-8601 formatted strings

/**
 * ISO-8601 date string type
 * All date fields in entities and DTOs MUST use this type
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 */
export type ISODateString = string;
