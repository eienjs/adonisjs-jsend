# @eienjs/adonisjs-jsend

[![Source Code][badge-source]][source]
[![Npm Node Version Support][badge-node-version]][node-version]
[![Latest Version][badge-release]][release]
[![Software License][badge-license]][license]
[![Build Status][badge-build]][build]
[![Total Downloads][badge-downloads]][downloads]

> Simple helpers to generate JSend-compliant JSON responses

The [JSend specification](https://github.com/omniti-labs/jsend) lays down some rules for how JSON responses from web servers should be formatted. JSend is especially suited for REST-style applications and APIs.

## Installation

Install and configure the package using the following command :

```bash
node ace add @eienjs/adonisjs-jsend
```

## Usage

In your controller:

```ts
import { type HttpContext } from '@adonisjs/core/http';
import User from '#models/user';
import { loginValidator } from '#validators/auth/login';

export default class LoginController {
  public async handle({ request, response, auth }: HttpContext): Promise<void> {
    const { email, password, terms } = await request.validateUsing(loginValidator);

    if (terms === false) {
      return response.jsendFail({ terms: 'Terms is required accepted' });
    }

    try {
      const user = await User.verifyCredentials(email, password);
      await auth.use('web').login(user);

      response.jsendSuccess({ auth: 'Sesión iniciada' });
    } catch (error) {
      response.jsendError(`Unable to login user: ${e.message}`);
    }
  }
}
```

Macros are also registered to extend `ExceptionHandler` and allow JSON responses to be formatted for unhandled exceptions and validators errors as JSend. You can disable this approach using property withJsend in your extended class ExceptionHandler:

```ts
export default class HttpExceptionHandler extends ExceptionHandler {
  public usingJsend = false; // Default is true
}
```

## Available helpers

```ts
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
```

## Copyright and License

The `@eienjs/adonisjs-jsend` library is licensed for use under the MIT License (MIT). Please see [LICENSE][] for more information.

[source]: https://github.com/eienjs/adonisjs-jsend
[node-version]: https://www.npmjs.com/package/@eienjs/adonisjs-jsend
[release]: https://www.npmjs.com/package/@eienjs/adonisjs-jsend
[license]: https://github.com/eienjs/adonisjs-jsend/blob/main/LICENSE.md
[build]: https://github.com/eienjs/adonisjs-jsend/actions/workflows/test.yml?query=branch:main
[downloads]: https://www.npmjs.com/package/@eienjs/adonisjs-jsend
[badge-source]: https://img.shields.io/badge/source-eienjs/adonisjs--jsend-blue.svg?logo=github
[badge-node-version]: https://img.shields.io/node/v/@eienjs/adonisjs-jsend.svg?logo=nodedotjs
[badge-release]: https://img.shields.io/npm/v/@eienjs/adonisjs-jsend.svg?logo=npm
[badge-license]: https://img.shields.io/github/license/eienjs/adonisjs-jsend?logo=open-source-initiative
[badge-build]: https://img.shields.io/github/actions/workflow/status/eienjs/adonisjs-jsend/test.yml?branch=main
[badge-downloads]: https://img.shields.io/npm/dm/@eienjs/adonisjs-jsend.svg?logo=npm
