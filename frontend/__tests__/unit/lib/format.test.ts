import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatRelativeTime,
  formatMonth,
} from '@/lib/utils/format'

describe('formatDate', () => {
  it('日付文字列を指定フォーマットで変換できる', () => {
    const result = formatDate('2024-12-25', 'yyyy年MM月dd日')
    expect(result).toBe('2024年12月25日')
  })

  it('Dateオブジェクトを指定フォーマットで変換できる', () => {
    const date = new Date('2024-12-25')
    const result = formatDate(date, 'yyyy年MM月dd日')
    expect(result).toBe('2024年12月25日')
  })

  it('デフォルトフォーマット（yyyy年MM月dd日）が適用される', () => {
    const result = formatDate('2024-12-25')
    expect(result).toBe('2024年12月25日')
  })

  it('カスタムフォーマットを指定できる', () => {
    const result = formatDate('2024-12-25', 'yyyy/MM/dd')
    expect(result).toBe('2024/12/25')
  })
})

describe('formatDateTime', () => {
  it('日時を年月日 時:分形式で変換できる', () => {
    const result = formatDateTime('2024-12-25T19:30:00')
    expect(result).toBe('2024年12月25日 19:30')
  })

  it('Dateオブジェクトを年月日 時:分形式で変換できる', () => {
    const date = new Date('2024-12-25T19:30:00')
    const result = formatDateTime(date)
    expect(result).toBe('2024年12月25日 19:30')
  })
})

describe('formatCurrency', () => {
  it('金額を日本円形式で変換できる', () => {
    const result = formatCurrency(10000)
    expect(result).toBe('¥10,000')
  })

  it('0円を正しく変換できる', () => {
    const result = formatCurrency(0)
    expect(result).toBe('¥0')
  })

  it('大きな金額を正しく変換できる', () => {
    const result = formatCurrency(1234567)
    expect(result).toBe('¥1,234,567')
  })

  it('小数点以下は切り捨てられる', () => {
    const result = formatCurrency(1000.99)
    expect(result).toBe('¥1,000')
  })

  it('負の金額を正しく変換できる', () => {
    const result = formatCurrency(-5000)
    expect(result).toBe('¥-5,000')
  })
})

describe('formatRelativeTime', () => {
  it('現在時刻から相対的な時間を表示できる', () => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const result = formatRelativeTime(fiveMinutesAgo)
    expect(result).toContain('分前')
  })

  it('日付文字列から相対時間を表示できる', () => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(oneDayAgo.toISOString())
    expect(result).toContain('前')
  })

  it('Dateオブジェクトから相対時間を表示できる', () => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const result = formatRelativeTime(oneHourAgo)
    expect(result).toContain('時間前')
  })
})

describe('formatMonth', () => {
  it('年月形式で変換できる', () => {
    const result = formatMonth('2024-12-25')
    expect(result).toBe('2024年12月')
  })

  it('Dateオブジェクトを年月形式で変換できる', () => {
    const date = new Date('2024-01-15')
    const result = formatMonth(date)
    expect(result).toBe('2024年01月')
  })

  it('日付部分は無視される', () => {
    const result1 = formatMonth('2024-12-01')
    const result2 = formatMonth('2024-12-31')
    expect(result1).toBe(result2)
    expect(result1).toBe('2024年12月')
  })
})
