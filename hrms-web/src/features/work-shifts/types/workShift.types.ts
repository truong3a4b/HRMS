export type WorkShift = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  lateGracePeriod?: number | null;
  earlyLeaveGracePeriod?: number | null;
  checkInFlexibilityMinutes?: number | null;
  checkOutFlexibilityMinutes?: number | null;
  isOvertime: boolean;
  workUnits: number | string;
  overtimeMultiplier?: number | string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WorkShiftFormPayload = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  lateGracePeriod?: number;
  earlyLeaveGracePeriod?: number;
  checkInFlexibilityMinutes?: number;
  checkOutFlexibilityMinutes?: number;
  isOvertime?: boolean;
  workUnits: number;
  overtimeMultiplier?: number;
  isActive?: boolean;
};
