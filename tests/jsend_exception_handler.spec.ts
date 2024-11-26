import { Exception } from '@adonisjs/core/exceptions';
import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { ExceptionHandler, ResponseStatus } from '@adonisjs/core/http';
import { test } from '@japa/runner';
import { SimpleErrorReporter } from '@vinejs/vine';
import { fieldContext } from '@vinejs/vine/factories';

test.group('Jsend exception handler | handle', (group) => {
  group.each.setup(async () => {
    await import('../src/jsend_response_macros.js');
    await import('../src/jsend_exception_handler_macros.js');
  });

  test('handle error by pretty printing it using youch', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.match(ctx.response.getBody() as string, /<html/);
  });

  test('pretty error as JSON jsend standard when request accepts JSON', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'data']);
    assert.containsSubset(ctx.response.getBody(), { status: 'error' });
  });

  test('pretty error as JSON jsend standard when request accepts JSONAPI', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/vnd.api+json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'data']);
  });

  test('do not render stack trace when debugging is disabled', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      protected debug = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), 500);
    assert.equal(ctx.response.getBody(), '<p> Something went wrong </p>');
  });

  test('jsend fail when debugging is disabled', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      protected debug = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'data']);
    assert.containsSubset(ctx.response.getBody(), { status: 'fail' });
  });

  test('use error status code', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const error = new Exception('Something went wrong', { status: ResponseStatus.Unauthorized });
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.Unauthorized);
  });

  test('render validation error to a string', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    const reporter = new SimpleErrorReporter();
    reporter.report('Username is not unique', 'unique', fieldContext.create('username', ''), { table: 'users' });

    await exceptionHandler.handle(reporter.createError(), ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.UnprocessableEntity);
    assert.equal(ctx.response.getBody(), 'username - Username is not unique');
  });

  test('render validation error to JSON jsend standard', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const reporter = new SimpleErrorReporter();
    reporter.report('Username is not unique', 'unique', fieldContext.create('username', ''), { table: 'users' });

    await exceptionHandler.handle(reporter.createError(), ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.UnprocessableEntity);
    assert.containsSubset(ctx.response.getBody(), {
      status: 'fail',
      data: {
        errors: [
          {
            field: 'username',
            rule: 'unique',
            meta: {
              table: 'users',
            },
            message: 'Username is not unique',
          },
        ],
      },
    });
  });

  test('render validation error to JSON jsend standard from JSONAPI', async ({ assert }) => {
    const exceptionHandler = new ExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/vnd.api+json';

    const reporter = new SimpleErrorReporter();
    reporter.report('Username is not unique', 'unique', fieldContext.create('username', ''), { table: 'users' });

    await exceptionHandler.handle(reporter.createError(), ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.UnprocessableEntity);
    assert.containsSubset(ctx.response.getBody(), {
      status: 'fail',
      data: {
        errors: [
          {
            field: 'username',
            rule: 'unique',
            meta: {
              table: 'users',
            },
            message: 'Username is not unique',
          },
        ],
      },
    });
  });

  test('disabled jsend handle normal JSON', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      public usingJsend = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['message', 'frames']);
  });

  test('disabled jsend handle normal JSONAPI', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      public usingJsend = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/vnd.api+json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['message', 'frames']);
  });

  test('disabled jsend handle normal validation JSON', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      public usingJsend = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/json';

    const reporter = new SimpleErrorReporter();
    reporter.report('Username is not unique', 'unique', fieldContext.create('username', ''), { table: 'users' });

    await exceptionHandler.handle(reporter.createError(), ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.UnprocessableEntity);
    assert.deepEqual(ctx.response.getBody(), {
      errors: [
        {
          field: 'username',
          message: 'Username is not unique',
          meta: {
            table: 'users',
          },
          rule: 'unique',
        },
      ],
    });
  });

  test('disabled jsend handle normal validation JSONAPI', async ({ assert }) => {
    class AppExceptionHandler extends ExceptionHandler {
      public usingJsend = false;
    }

    const exceptionHandler = new AppExceptionHandler();
    const ctx = new HttpContextFactory().create();

    ctx.request.request.headers.accept = 'application/vnd.api+json';

    const error = new Error('Something went wrong');
    await exceptionHandler.handle(error, ctx);

    const reporter = new SimpleErrorReporter();
    reporter.report('Username is not unique', 'unique', fieldContext.create('username', ''), { table: 'users' });

    await exceptionHandler.handle(reporter.createError(), ctx);

    assert.equal(ctx.response.getStatus(), ResponseStatus.UnprocessableEntity);
    assert.deepEqual(ctx.response.getBody(), {
      errors: [
        {
          source: {
            pointer: 'username',
          },
          title: 'Username is not unique',
          meta: {
            table: 'users',
          },
          code: 'unique',
        },
      ],
    });
  });
});
