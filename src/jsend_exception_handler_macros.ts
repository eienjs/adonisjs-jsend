import type { HttpContext } from '@adonisjs/core/http';
import type { HttpError } from '@adonisjs/core/types/http';
import { ExceptionHandler } from '@adonisjs/core/http';

ExceptionHandler.macro(
  'renderErrorAsJsend',
  async function (this: ExceptionHandler, error: HttpError, ctx: HttpContext) {
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
  },
);

ExceptionHandler.macro(
  'renderValidationErrorAsJsend',
  // eslint-disable-next-line @typescript-eslint/require-await
  async function (this: ExceptionHandler, error: HttpError, ctx: HttpContext) {
    ctx.response.jsendFail(
      {
        errors: error.messages as unknown,
      },
      error.status,
    );
  },
);

ExceptionHandler.macro('renderError', async function (this: ExceptionHandler, error: HttpError, ctx: HttpContext) {
  const isJsendEnable = this.usingJsend ?? true;

  switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
    case 'application/vnd.api+json': {
      return isJsendEnable ? this.renderErrorAsJsend(error, ctx) : this.renderErrorAsJSONAPI(error, ctx);
    }
    case 'json': {
      return isJsendEnable ? this.renderErrorAsJsend(error, ctx) : this.renderErrorAsJSON(error, ctx);
    }
    default: {
      return this.renderErrorAsHTML(error, ctx);
    }
  }
});

ExceptionHandler.macro(
  'renderValidationError',
  async function (this: ExceptionHandler, error: HttpError, ctx: HttpContext) {
    const isJsendEnable = this.usingJsend ?? true;

    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json': {
        return isJsendEnable
          ? this.renderValidationErrorAsJsend(error, ctx)
          : this.renderValidationErrorAsJSONAPI(error, ctx);
      }
      case 'json': {
        return isJsendEnable
          ? this.renderValidationErrorAsJsend(error, ctx)
          : this.renderValidationErrorAsJSON(error, ctx);
      }
      default: {
        return this.renderValidationErrorAsHTML(error, ctx);
      }
    }
  },
);
