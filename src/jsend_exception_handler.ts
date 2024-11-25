import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http';
import { type HttpError } from '@adonisjs/core/types/http';

export default class JsendExceptionHandler extends ExceptionHandler {
  public async renderErrorAsJsend(error: HttpError, ctx: HttpContext): Promise<void> {
    let additionalData: Record<string, unknown> | undefined;

    if (this.isDebuggingEnabled(ctx)) {
      const { default: Youch } = await import('youch');
      additionalData = await new Youch(error, ctx.request.request).toJSON();
    }

    if (additionalData) {
      ctx.response.jsendError(error.message, error.status, { errors: additionalData, code: error.code });

      return;
    }

    ctx.response.jsendFail(
      {
        errors: [
          {
            title: error.message,
            code: error.code,
          },
        ],
      },
      error.status,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async renderValidationErrorAsJsend(error: HttpError, ctx: HttpContext): Promise<void> {
    ctx.response.jsendFail(
      {
        errors: (error.messages as Record<string, unknown>[]).map((message) => {
          return {
            title: message.message,
            code: message.rule,
            source: {
              pointer: message.field,
            },
            meta: message.meta,
          };
        }),
      },
      error.status,
    );
  }

  public override renderError(error: HttpError, ctx: HttpContext): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json':
      case 'json': {
        return this.renderErrorAsJsend(error, ctx);
      }
      default: {
        return this.renderErrorAsHTML(error, ctx);
      }
    }
  }

  public override renderValidationError(error: HttpError, ctx: HttpContext): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json':
      case 'json': {
        return this.renderValidationErrorAsJsend(error, ctx);
      }
      default: {
        return this.renderValidationErrorAsHTML(error, ctx);
      }
    }
  }
}
