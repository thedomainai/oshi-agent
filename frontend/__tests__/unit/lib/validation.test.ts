import { describe, it, expect } from 'vitest'
import { oshiSchema, expenseSchema, settingsSchema } from '@/lib/utils/validation'

describe('oshiSchema', () => {
  it('正常な推しデータをバリデーションできる', () => {
    const validData = {
      name: 'テストアーティスト',
      category: 'アイドル',
      keywords: ['ライブ', 'CD'],
      sources: ['https://example.com'],
    }
    const result = oshiSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('名前が空の場合エラーになる', () => {
    const invalidData = {
      name: '',
      category: 'アイドル',
      keywords: ['ライブ'],
      sources: ['https://example.com'],
    }
    const result = oshiSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('推しの名前を入力してください')
    }
  })

  it('名前が100文字を超える場合エラーになる', () => {
    const invalidData = {
      name: 'a'.repeat(101),
      category: 'アイドル',
      keywords: ['ライブ'],
      sources: ['https://example.com'],
    }
    const result = oshiSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名前は100文字以内で入力してください')
    }
  })

  it('カテゴリが空の場合エラーになる', () => {
    const invalidData = {
      name: 'テストアーティスト',
      category: '',
      keywords: ['ライブ'],
      sources: ['https://example.com'],
    }
    const result = oshiSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('カテゴリを入力してください')
    }
  })

  it('キーワードが空配列の場合エラーになる', () => {
    const invalidData = {
      name: 'テストアーティスト',
      category: 'アイドル',
      keywords: [],
      sources: ['https://example.com'],
    }
    const result = oshiSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('少なくとも1つのキーワードを入力してください')
    }
  })

  it('情報源が空配列の場合エラーになる', () => {
    const invalidData = {
      name: 'テストアーティスト',
      category: 'アイドル',
      keywords: ['ライブ'],
      sources: [],
    }
    const result = oshiSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('少なくとも1つの情報源を入力してください')
    }
  })
})

describe('expenseSchema', () => {
  it('正常な支出データをバリデーションできる', () => {
    const validData = {
      category: 'ticket',
      amount: 5000,
      description: 'ライブチケット',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('オプショナルフィールドを含む正常データをバリデーションできる', () => {
    const validData = {
      oshiId: 'oshi123',
      eventId: 'event456',
      category: 'goods',
      amount: 3000,
      description: 'グッズ購入',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('カテゴリが不正な値の場合エラーになる', () => {
    const invalidData = {
      category: 'invalid',
      amount: 5000,
      description: 'テスト',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('金額が1未満の場合エラーになる', () => {
    const invalidData = {
      category: 'ticket',
      amount: 0,
      description: 'テスト',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('金額を入力してください')
    }
  })

  it('金額が上限を超える場合エラーになる', () => {
    const invalidData = {
      category: 'ticket',
      amount: 10000001,
      description: 'テスト',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('金額が大きすぎます')
    }
  })

  it('説明が空の場合エラーになる', () => {
    const invalidData = {
      category: 'ticket',
      amount: 5000,
      description: '',
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('説明を入力してください')
    }
  })

  it('説明が200文字を超える場合エラーになる', () => {
    const invalidData = {
      category: 'ticket',
      amount: 5000,
      description: 'あ'.repeat(201),
      date: '2024-12-25',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('説明は200文字以内で入力してください')
    }
  })

  it('日付が空の場合エラーになる', () => {
    const invalidData = {
      category: 'ticket',
      amount: 5000,
      description: 'テスト',
      date: '',
    }
    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('日付を選択してください')
    }
  })
})

describe('settingsSchema', () => {
  it('正常な設定データをバリデーションできる', () => {
    const validData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'important',
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('オプショナルフィールドを含む正常データをバリデーションできる', () => {
    const validData = {
      notificationEnabled: true,
      emailNotification: true,
      priorityThreshold: 'urgent',
      budgetLimit: 50000,
      budgetAlertThreshold: 80,
      calendarSync: false,
    }
    const result = settingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('重要度閾値が不正な値の場合エラーになる', () => {
    const invalidData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'invalid',
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('予算上限が負の値の場合エラーになる', () => {
    const invalidData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'normal',
      budgetLimit: -1000,
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('予算上限は0以上で設定してください')
    }
  })

  it('警告閾値が100を超える場合エラーになる', () => {
    const invalidData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'normal',
      budgetAlertThreshold: 101,
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('警告閾値は0-100%で設定してください')
    }
  })

  it('警告閾値が0の場合は正常', () => {
    const validData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'normal',
      budgetAlertThreshold: 0,
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('警告閾値が100の場合は正常', () => {
    const validData = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'normal',
      budgetAlertThreshold: 100,
      calendarSync: true,
    }
    const result = settingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
