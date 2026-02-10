import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern: string = 'yyyy年MM月dd日'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ja })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy年MM月dd日 HH:mm', { locale: ja })
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ja })
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy年MM月', { locale: ja })
}
