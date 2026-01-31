export function useFormatters() {
  const formatMoney = (kopecks: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(kopecks / 100)
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '—'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return {
    formatMoney,
    formatDate,
    formatDateTime
  }
}
