export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

export const formatDate = (dateString: string, locale: string = 'vi-VN'): string => {
  // Parse YYYY-MM-DD as local date to avoid timezone issues
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const day = parseInt(parts[2]);
    return new Date(year, month, day).toLocaleDateString(locale);
  }
  // Fallback for other formats
  return new Date(dateString).toLocaleDateString(locale);
};

export const formatNumber = (value: number, locale: string = 'vi-VN'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

// Create Date object from YYYY-MM-DD string without timezone shift
export const createLocalDate = (dateString: string): Date => {
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  // Fallback for other formats
  return new Date(dateString);
};

// Convert date to YYYY-MM-DD string without timezone issues
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 