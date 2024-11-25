import { Response, ResponseStatus } from '@adonisjs/core/http';

Response.macro('jsendSuccess', function (this: Response, data, status = ResponseStatus.Ok) {
  this.status(status).json({
    status: 'sucess',
    data: data === undefined ? null : data,
  });
});

Response.macro('jsendFail', function (this: Response, data, status = ResponseStatus.BadRequest) {
  this.status(status).json({
    status: 'fail',
    data,
  });
});

Response.macro(
  'jsendError',
  function (
    this: Response,
    message,
    status = ResponseStatus.InternalServerError,
    additionalData?: { code?: string | number; errors?: unknown },
  ) {
    this.status(status).json({
      status: 'error',
      message,
      data: additionalData?.errors,
      code: additionalData?.code,
    });
  },
);
