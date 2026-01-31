// Генерация QR-кода для СБП (Система Быстрых Платежей) по ГОСТ Р 56042-2014
import QRCode from 'qrcode'
import type { Invoice, Merchant } from '~/shared/types/database'

// Данные для генерации QR-кода платежа
export interface QRPaymentData {
  // Получатель (мерчант)
  name: string
  personalAcc: string
  bankName: string
  bic: string
  correspAcc: string
  payeeINN?: string
  kpp?: string

  // Плательщик (клиент)
  lastName: string
  firstName: string
  middleName?: string
  payerAddress?: string

  // Платёж
  purpose: string
  sum: number // в копейках
}

/**
 * Генерация строки для QR-кода по ГОСТ Р 56042-2014
 * Формат: ST00012|Name=...|PersonalAcc=...|...
 *
 * Версии:
 * - ST00011 = Windows-1251 encoding
 * - ST00012 = UTF-8 encoding (рекомендуется)
 */
export function generateQRPaymentString(data: QRPaymentData): string {
  const parts: string[] = ['ST00012'] // UTF-8 версия

  // Обязательные поля (получатель)
  parts.push(`Name=${escapeValue(data.name)}`)
  parts.push(`PersonalAcc=${data.personalAcc}`)
  parts.push(`BankName=${escapeValue(data.bankName)}`)
  parts.push(`BIC=${data.bic}`)
  parts.push(`CorrespAcc=${data.correspAcc}`)

  // Идентификаторы мерчанта
  if (data.payeeINN) {
    parts.push(`PayeeINN=${data.payeeINN}`)
  }
  if (data.kpp) {
    parts.push(`KPP=${data.kpp}`)
  }

  // Данные плательщика (опционально, но полезно для идентификации)
  if (data.lastName) {
    parts.push(`LastName=${escapeValue(data.lastName)}`)
  }
  if (data.firstName) {
    parts.push(`FirstName=${escapeValue(data.firstName)}`)
  }
  if (data.middleName) {
    parts.push(`MiddleName=${escapeValue(data.middleName)}`)
  }
  if (data.payerAddress) {
    parts.push(`PayerAddress=${escapeValue(data.payerAddress)}`)
  }

  // Детали платежа
  parts.push(`Purpose=${escapeValue(data.purpose)}`)
  parts.push(`Sum=${data.sum}`) // Сумма в копейках

  return parts.join('|')
}

/**
 * Построение данных для QR-кода из счёта и мерчанта
 */
export function buildQRPaymentData(
  invoice: Invoice,
  merchant: Merchant
): QRPaymentData {
  // Парсим ФИО плательщика
  const nameParts = parseFullName(invoice.payer_name)

  // Формируем назначение платежа
  const purpose = `Оплата по счету ${invoice.invoice_number}. ${invoice.description}`

  return {
    // Получатель (мерчант)
    name: merchant.full_name,
    personalAcc: merchant.bank_account || '',
    bankName: merchant.bank_name || '',
    bic: merchant.bank_bic || '',
    correspAcc: merchant.bank_corr_account || '',
    payeeINN: merchant.inn || undefined,
    kpp: merchant.kpp || undefined,

    // Плательщик (клиент)
    lastName: nameParts.lastName,
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    payerAddress: invoice.payer_address || undefined,

    // Платёж
    purpose,
    sum: invoice.amount // Сумма в копейках
  }
}

/**
 * Генерация QR-кода как base64 Data URL
 */
export async function generateQRCodeDataURL(
  paymentString: string,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  const qrOptions = {
    type: 'image/png' as const,
    width: options.width || 300,
    margin: options.margin || 2,
    errorCorrectionLevel: 'M' as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }

  return QRCode.toDataURL(paymentString, qrOptions)
}

// === Вспомогательные функции ===

/**
 * Экранирование специальных символов в значениях
 * Символ | является разделителем, поэтому его нужно убрать
 */
function escapeValue(value: string): string {
  return value
    .replace(/\|/g, '') // Удаляем pipe (не допускается)
    .replace(/\n/g, ' ') // Заменяем переносы на пробелы
    .trim()
}

/**
 * Парсинг полного имени на части (русский формат: "Фамилия Имя Отчество")
 */
function parseFullName(fullName: string): {
  lastName: string
  firstName: string
  middleName?: string
} {
  const [lastName = '', firstName = '', ...rest] = fullName.trim().split(/\s+/)
  const middleName = rest.length > 0 ? rest.join(' ') : undefined

  return { lastName, firstName, middleName }
}
