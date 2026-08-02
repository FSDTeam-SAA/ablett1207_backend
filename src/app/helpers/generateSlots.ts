/**
 * Reusable slot-generation helper.
 * Converts a start/end time range + appointment duration into a list of
 * fixed-length slots, automatically skipping any slot that overlaps the
 * given break window.
 *
 * All times are 24hr "HH:mm" strings, e.g. "09:00", "17:00", "13:30".
 */

export interface GenerateSlotsInput {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  durationMinutes: number; // 30
  breakStartTime?: string | null; // "13:00"
  breakEndTime?: string | null; // "13:30"
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function generateSlots(input: GenerateSlotsInput): GeneratedSlot[] {
  const { startTime, endTime, durationMinutes, breakStartTime, breakEndTime } =
    input;

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error('Invalid startTime or endTime format, expected "HH:mm"');
  }
  if (end <= start) {
    throw new Error('endTime must be after startTime');
  }
  if (!durationMinutes || durationMinutes <= 0) {
    throw new Error('durationMinutes must be a positive number');
  }

  const breakStart = breakStartTime ? timeToMinutes(breakStartTime) : null;
  const breakEnd = breakEndTime ? timeToMinutes(breakEndTime) : null;

  const slots: GeneratedSlot[] = [];
  let cursor = start;

  while (cursor + durationMinutes <= end) {
    const slotStart = cursor;
    const slotEnd = cursor + durationMinutes;

    const overlapsBreak =
      breakStart !== null &&
      breakEnd !== null &&
      slotStart < breakEnd &&
      slotEnd > breakStart;

    if (!overlapsBreak) {
      slots.push({
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
      });
    }

    cursor += durationMinutes;
  }

  return slots;
}

/**
 * Returns an inclusive array of "YYYY-MM-DD" date strings between
 * startDate and endDate.
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00.000Z`);
  const last = new Date(`${endDate}T00:00:00.000Z`);

  while (current.getTime() <= last.getTime()) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}