import { describe, it, expect } from 'vitest'
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ExternalApiError,
  handleError,
} from '@/lib/errors'

describe('AppError', () => {
  it('基本的なエラーを作成できる', () => {
    const error = new AppError('テストエラー')
    expect(error.message).toBe('テストエラー')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBeUndefined()
    expect(error.name).toBe('AppError')
  })

  it('ステータスコードとコードを指定できる', () => {
    const error = new AppError('テストエラー', 400, 'TEST_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('TEST_ERROR')
  })

  it('JSON形式に変換できる', () => {
    const error = new AppError('テストエラー', 400, 'TEST_ERROR')
    const json = error.toJSON()
    expect(json).toEqual({
      error: 'AppError',
      message: 'テストエラー',
      statusCode: 400,
      code: 'TEST_ERROR',
    })
  })

  it('スタックトレースが保持される', () => {
    const error = new AppError('テストエラー')
    expect(error.stack).toBeDefined()
  })
})

describe('NotFoundError', () => {
  it('デフォルトメッセージで作成できる', () => {
    const error = new NotFoundError()
    expect(error.message).toBe('リソースが見つかりません')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.name).toBe('NotFoundError')
  })

  it('カスタムメッセージで作成できる', () => {
    const error = new NotFoundError('ユーザーが見つかりません')
    expect(error.message).toBe('ユーザーが見つかりません')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
  })

  it('JSON形式に変換できる', () => {
    const error = new NotFoundError()
    const json = error.toJSON()
    expect(json).toEqual({
      error: 'NotFoundError',
      message: 'リソースが見つかりません',
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  })
})

describe('UnauthorizedError', () => {
  it('デフォルトメッセージで作成できる', () => {
    const error = new UnauthorizedError()
    expect(error.message).toBe('認証が必要です')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.name).toBe('UnauthorizedError')
  })

  it('カスタムメッセージで作成できる', () => {
    const error = new UnauthorizedError('トークンが無効です')
    expect(error.message).toBe('トークンが無効です')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('JSON形式に変換できる', () => {
    const error = new UnauthorizedError()
    const json = error.toJSON()
    expect(json).toEqual({
      error: 'UnauthorizedError',
      message: '認証が必要です',
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  })
})

describe('ValidationError', () => {
  it('デフォルトメッセージで作成できる', () => {
    const error = new ValidationError()
    expect(error.message).toBe('入力値が不正です')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.name).toBe('ValidationError')
    expect(error.errors).toBeUndefined()
  })

  it('エラー詳細を含めて作成できる', () => {
    const errors = {
      name: ['名前は必須です'],
      email: ['メールアドレスの形式が不正です'],
    }
    const error = new ValidationError('入力値が不正です', errors)
    expect(error.errors).toEqual(errors)
  })

  it('JSON形式に変換できる', () => {
    const errors = {
      name: ['名前は必須です'],
    }
    const error = new ValidationError('入力値が不正です', errors)
    const json = error.toJSON()
    expect(json).toEqual({
      error: 'ValidationError',
      message: '入力値が不正です',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      errors: {
        name: ['名前は必須です'],
      },
    })
  })
})

describe('ExternalApiError', () => {
  it('デフォルトメッセージで作成できる', () => {
    const error = new ExternalApiError()
    expect(error.message).toBe('外部APIとの通信に失敗しました')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('EXTERNAL_API_ERROR')
    expect(error.name).toBe('ExternalApiError')
  })

  it('カスタムメッセージとステータスコードで作成できる', () => {
    const error = new ExternalApiError('Google API エラー', 503)
    expect(error.message).toBe('Google API エラー')
    expect(error.statusCode).toBe(503)
    expect(error.code).toBe('EXTERNAL_API_ERROR')
  })

  it('JSON形式に変換できる', () => {
    const error = new ExternalApiError()
    const json = error.toJSON()
    expect(json).toEqual({
      error: 'ExternalApiError',
      message: '外部APIとの通信に失敗しました',
      statusCode: 500,
      code: 'EXTERNAL_API_ERROR',
    })
  })
})

describe('handleError', () => {
  it('AppErrorを適切に処理できる', () => {
    const error = new AppError('テストエラー', 400, 'TEST_ERROR')
    const response = handleError(error)
    expect(response.status).toBe(400)
  })

  it('NotFoundErrorを適切に処理できる', () => {
    const error = new NotFoundError()
    const response = handleError(error)
    expect(response.status).toBe(404)
  })

  it('通常のErrorを500エラーとして処理できる', () => {
    const error = new Error('予期しないエラー')
    const response = handleError(error)
    expect(response.status).toBe(500)
  })

  it('不明なエラーを500エラーとして処理できる', () => {
    const error = 'string error'
    const response = handleError(error)
    expect(response.status).toBe(500)
  })

  it('ValidationErrorのエラー詳細が含まれる', async () => {
    const errors = { name: ['名前は必須です'] }
    const error = new ValidationError('入力値が不正です', errors)
    const response = handleError(error)
    const json = await response.json()
    expect(json.errors).toEqual(errors)
  })
})
