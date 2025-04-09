export type DateRange = {
  startDate: string;
  endDate: string;
};

function isValidDateFormat(dateStr: string): boolean {
  //assumed format is dd-mm-yyyy
  const parts = dateStr.split("-");
  if (parts.length !== 3) return false;

  const day = isNaN(+parts[0]) ? null : +parts[0];
  const month = isNaN(+parts[1]) ? null : +parts[1];
  const year = isNaN(+parts[2]) ? null : +parts[2];

  if (!day || !month || !year) return false;

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month - 1, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  if (parts[2].length !== 4) return false;

  return true;
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function validateDateRange(range: DateRange): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (!isValidDateFormat(range.startDate)) {
    return {
      isValid: false,
      errorMessage: "Start date is not in valid dd-mm-yyyy format",
    };
  }

  if (!isValidDateFormat(range.endDate)) {
    return {
      isValid: false,
      errorMessage: "End date is not in valid dd-mm-yyyy format",
    };
  }

  const startDate = parseDate(range.startDate);
  const endDate = parseDate(range.endDate);

  if (endDate < startDate) {
    return {
      isValid: false,
      errorMessage: "End date cannot be earlier than start date",
    };
  }

  return { isValid: true };
}
