/**
 * Standardised success response envelope.
 * { success: true, message, data }
 */
export class ApiResponse<T = unknown> {
  public success = true;
  constructor(
    public statusCode: number,
    public data: T,
    public message = 'Success'
  ) {}
}
