import type { HttpContext } from '@adonisjs/core/http';
import type { ApplicationService } from '@adonisjs/core/types';
import type { HttpError } from '@adonisjs/core/types/http';

declare module '@adonisjs/core/http' {
  interface Response {
    /**
     * Send success response using jsend standard
     *
     * @param {*} [data] - Any data returned by the API call
     * @param {number} [status=200] - Status code number
     */
    jsendSuccess: (data?: unknown, status?: number) => void;
    /**
     * Send fail response using jsend standard
     *
     * @param {*} data - Any data returned by the API call
     * @param {number} [status=400] - Status code number
     */
    jsendFail: (data: unknown, status?: number) => void;
    /**
     * Send error response using jsend standard
     *
     * @param {string} message - A meaningful, end-user-readable (or at the least log-worthy) message, explaining what went wrong
     * @param {number} [status=500] - Status code number
     * @param {object} [options] - Additional options
     * @param {(string|number)} [options.code] - A numeric code corresponding to the error, if applicable
     * @param {*} [options.errors] - A generic container for any other information about the error, i.e. the conditions that caused the error, stack traces, etc
     */
    jsendError: (message: string, status?: number, options?: { code?: string | number; errors?: unknown }) => void;
  }

  interface ExceptionHandler {
    renderErrorAsJsend: (error: HttpError, ctx: HttpContext) => Promise<void>;
    renderValidationErrorAsJsend: (error: HttpError, ctx: HttpContext) => Promise<void>;
    /**
     * Whether or not to using jsend standard. When set to true, the errors
     * will handle using jsend standard, default is enabled.
     */
    usingJsend?: boolean;
  }
}

export default class JsendProvider {
  public constructor(protected app: ApplicationService) {}

  /**
   * The container bindings have booted
   */
  public async boot(): Promise<void> {
    await import('../src/jsend_response_macros.js');
    await import('../src/jsend_exception_handler_macros.js');
  }
}
