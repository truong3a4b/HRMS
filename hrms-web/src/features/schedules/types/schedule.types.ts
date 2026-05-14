import type { WorkShift } from "../../work-shifts/types/workShift.types";

export type ScheduleDetailPayload = {
  date: string;
  workShiftIds: string[];
};

export type WorkScheduleItem = {
  id: string;
  date: string;
  workShifts: Array<
    Pick<WorkShift, "id" | "code" | "name"> &
      Partial<Pick<WorkShift, "startTime" | "endTime">>
  >;
};

export type CreateScheduleSetupPayload = {
  name: string;
  description?: string;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  scheduleDetails: ScheduleDetailPayload[];
};

export type RegisterSchedulePayload = {
  title: string;
  description?: string;
  month: string;
  approvalMode?: "PARALLEL" | "SEQUENTIAL";
  approverIds: string[];
  watcherIds?: string[];
  scheduleDetails: ScheduleDetailPayload[];
};

export type WorkScheduleSetup = {
  id: string;
  name: string;
  description?: string | null;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  scheduleDetails: ScheduleDetailPayload[];
  createdAt?: string;
};
