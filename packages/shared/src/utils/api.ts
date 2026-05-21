// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | null;
  meta?: Record<string, any>;
}

// API Error class extending Error
export class ApiError extends Error {
  public statusCode: number;
  public validationErrors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, validationErrors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    
    // Maintains proper stack trace for instances of Error classes
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
    
    // Ensures instanceof ApiError works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Utility types
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Nullable<T> = T | null;

export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}