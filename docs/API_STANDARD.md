# API_STANDARD.md — API Response Standardization

## Status: ENFORCED

## Standard Response

```ts
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  meta?: PaginationMeta
}
```

## Standard Error

```ts
interface ApiError {
  code: string
  message: string
  details?: unknown
  field?: string
}
```

## Pagination Meta

```ts
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

## List Response

```ts
interface ListResponse<T> {
  items: T[]
  pagination: PaginationMeta
}
```

## HTTP Methods

| Method | Purpose | Body |
|--------|---------|------|
| GET | Read resources | No |
| POST | Create resources | Yes |
| PATCH | Partial update | Yes |
| PUT | Full replacement | Yes |
| DELETE | Remove resource | No |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## REQUIRED

✅ ALL endpoints MUST return ApiResponse<T>
✅ ALL errors MUST return ApiError shape
✅ ALL list endpoints MUST support pagination
✅ ALL endpoints MUST be documented
✅ ALL endpoints MUST validate input
✅ ALL endpoints MUST handle errors gracefully

## FORBIDDEN

❌ Random response shapes
❌ Inconsistent error formats
❌ Missing pagination on list endpoints
❌ Exposing internal errors to clients
❌ Using non-standard status codes

## Request Validation

All POST/PATCH requests MUST be validated using @nurisk/validation schemas:

```ts
import { createIncidentSchema } from '@nurisk/validation'

// In controller
const validated = createIncidentSchema.parse(request.body)
```

## Error Response Format

```ts
// 400 Bad Request
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [...],
    field: 'email'
  }
}

// 401 Unauthorized
{
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}

// 404 Not Found
{
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'Resource not found'
  }
}

// 500 Internal Server Error
{
  success: false,
  error: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  }
}
```

## API Versioning

- Use URL versioning: `/api/v1/...`
- Maintain backward compatibility
- Deprecate old versions with notice
- Document breaking changes