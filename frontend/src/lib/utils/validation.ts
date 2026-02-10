import { z } from 'zod'

export const oshiSchema = z.object({
  name: z.string().min(1, '推しの名前を入力してください').max(100, '名前は100文字以内で入力してください'),
  category: z.string().min(1, 'カテゴリを入力してください').max(50, 'カテゴリは50文字以内で入力してください'),
  keywords: z.array(z.string()).min(1, '少なくとも1つのキーワードを入力してください'),
  sources: z.array(z.string()).min(1, '少なくとも1つの情報源を入力してください'),
})

export const expenseSchema = z.object({
  oshiId: z.string().optional(),
  eventId: z.string().optional(),
  category: z.enum(['ticket', 'goods', 'trip', 'other'], {
    required_error: 'カテゴリを選択してください',
  }),
  amount: z.number().min(1, '金額を入力してください').max(10000000, '金額が大きすぎます'),
  description: z.string().min(1, '説明を入力してください').max(200, '説明は200文字以内で入力してください'),
  date: z.string().min(1, '日付を選択してください'),
})

export const settingsSchema = z.object({
  notificationEnabled: z.boolean(),
  emailNotification: z.boolean(),
  priorityThreshold: z.enum(['urgent', 'important', 'normal']),
  budgetLimit: z.number().min(0, '予算上限は0以上で設定してください').optional(),
  budgetAlertThreshold: z.number().min(0).max(100, '警告閾値は0-100%で設定してください').optional(),
  calendarSync: z.boolean(),
})

export type OshiFormData = z.infer<typeof oshiSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
