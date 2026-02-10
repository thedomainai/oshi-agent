export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    }
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '入力値が不正です', public errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR')
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    }
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string = '外部APIとの通信に失敗しました', statusCode: number = 500) {
    super(message, statusCode, 'EXTERNAL_API_ERROR')
  }
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(error.toJSON(), { status: error.statusCode })
  }

  if (error instanceof Error) {
    return Response.json(
      {
        error: 'InternalServerError',
        message: error.message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }

  return Response.json(
    {
      error: 'InternalServerError',
      message: '不明なエラーが発生しました',
      statusCode: 500,
    },
    { status: 500 }
  )
}
