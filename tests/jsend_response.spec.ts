import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { ResponseStatus } from '@adonisjs/core/http';
import { test } from '@japa/runner';

test.group('Jsend response', (group) => {
  group.each.setup(async () => {
    await import('../src/jsend_response_macros.js');
  });

  test('jsend success generates a response with status code 200', ({ assert }) => {
    const ctx = new HttpContextFactory().create();
    ctx.response.jsendSuccess();

    assert.equal(ctx.response.getStatus(), ResponseStatus.Ok);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status']);
    assert.containSubset(ctx.response.getBody(), { status: 'success' });
  });

  test('jsend success generates a response with specific status code', ({ assert }) => {
    const ctx = new HttpContextFactory().create();
    ctx.response.jsendSuccess('hi', ResponseStatus.Created);

    assert.equal(ctx.response.getStatus(), ResponseStatus.Created);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'data']);
    assert.containSubset(ctx.response.getBody(), { status: 'success', data: 'hi' });
  });

  test('jsend error generates a response with status code 500', ({ assert }) => {
    const ctx = new HttpContextFactory().create();
    ctx.response.jsendError('Something happened');

    assert.equal(ctx.response.getStatus(), ResponseStatus.InternalServerError);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'message']);
    assert.containSubset(ctx.response.getBody(), { status: 'error', message: 'Something happened' });
  });

  test('jsend fail generates a response with status code 400', ({ assert }) => {
    const ctx = new HttpContextFactory().create();
    ctx.response.jsendFail({ message: 'Something happened' });

    assert.equal(ctx.response.getStatus(), ResponseStatus.BadRequest);
    assert.isObject(ctx.response.getBody());
    assert.properties(ctx.response.getBody(), ['status', 'data']);
    assert.containSubset(ctx.response.getBody(), { status: 'fail', data: { message: 'Something happened' } });
  });
});
