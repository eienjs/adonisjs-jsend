import { type ApplicationService } from '@adonisjs/core/types';

declare module '@adonisjs/core/http' {
  interface Response {
    /**
     * Send success response using jsend standard
     *
     * @param {*} [data] - Any data returned by the API call
     * @param {number} [status=200] - Status code number
     */
    jsendSuccess(data?: unknown, status?: number): void;
    /**
     * Send fail response using jsend standard
     *
     * @param {*} data - Any data returned by the API call
     * @param {number} [status=400] - Status code number
     */
    jsendFail(data: unknown, status?: number): void;
    /**
     * Send error response using jsend standard
     *
     * @param {string} message - A meaningful, end-user-readable (or at the least log-worthy) message, explaining what went wrong
     * @param {number} [status=500] - Status code number
     * @param {Object} [options] - Additional options
     * @param {(string|number)} [options.code] - A numeric code corresponding to the error, if applicable
     * @param {*} [options.errors] - A generic container for any other information about the error, i.e. the conditions that caused the error, stack traces, etc
     */
    jsendError(message: string, status?: number, options?: { code?: string | number; errors?: unknown }): void;
  }
}

export default class JsendProvider {
  public constructor(protected app: ApplicationService) {}

  /**
   * The container bindings have booted
   */
  public async boot(): Promise<void> {
    await import('../src/jsend.js');
  }
}
