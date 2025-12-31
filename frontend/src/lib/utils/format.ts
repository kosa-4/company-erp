/**
 * 포맷팅 유틸리티 함수
 * 숫자, 통화, 날짜를 화면에 보기 좋게 변환합니다.
 */

/**
 * 숫자 포맷팅 (천단위 콤마)
 * @example formatNumber(1500000) → "1,500,000"
 */
export const formatNumber = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('ko-KR').format(num);
};

/**
 * 통화 포맷팅 (원화)
 * @example formatCurrency(1500000) → "₩1,500,000"
 */
export const formatCurrency = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) return '₩0';
  return `₩${formatNumber(num)}`;
};

/**
 * 날짜 포맷팅
 * @example formatDate('2024-12-31') → "2024. 12. 31."
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('ko-KR').format(new Date(date));
  } catch {
    return '';
  }
};

/**
 * 날짜+시간 포맷팅
 * @example formatDateTime('2024-12-31T14:30:00') → "2024. 12. 31. 오후 2:30"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return '';
  }
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환 (input[type="date"]용)
 * @example formatDateInput(new Date()) → "2024-12-31"
 */
export const formatDateInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * 전화번호 포맷팅
 * @example formatPhoneNumber('01012345678') → "010-1234-5678"
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

/**
 * 사업자등록번호 포맷팅
 * @example formatBusinessNumber('1234567890') → "123-45-67890"
 */
export const formatBusinessNumber = (num: string | null | undefined): string => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
  }
  
  return num;
};
