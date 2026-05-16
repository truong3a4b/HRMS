jest.mock("../config/prisma", () => ({
  prisma: {
    workShift: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from "../config/prisma";
import { workShiftService } from "./work-shift.service";

const prismaMock = prisma as unknown as {
  workShift: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe("workShiftService", () => {
  const today = new Date("2026-05-16T08:00:00.000Z");
  const todayStart = new Date("2026-05-16T00:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates a new shift version and moves only future schedules when updating shift fields", async () => {
    const currentShift = {
      id: "shift-old",
      code: "HC",
      name: "Hanh chinh",
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: null,
      breakEndTime: null,
      lateGracePeriod: 5,
      earlyLeaveGracePeriod: 5,
      checkInStartTime: "07:30",
      checkInEndTime: "08:30",
      checkOutStartTime: "16:30",
      checkOutEndTime: "17:30",
      isOvertime: false,
      workUnits: 1,
      overtimeMultiplier: null,
      isActive: true,
      createdAt: today,
      updatedAt: today,
    };
    const newShift = {
      ...currentShift,
      id: "shift-new",
      name: "Hanh chinh moi",
    };
    const update = jest.fn();
    const create = jest.fn().mockResolvedValue(newShift);
    const updateMany = jest.fn();
    const setupUpdate = jest.fn();
    const requestUpdate = jest.fn();

    prismaMock.workShift.findUnique.mockResolvedValue(currentShift);
    prismaMock.workShift.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        workShift: { update, create },
        workScheduleShift: { updateMany },
        workScheduleSetup: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: "setup-1",
              scheduleDetails: [
                {
                  date: "2026-05-15T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
                {
                  date: "2026-05-16T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
                {
                  date: "2026-05-17T00:00:00.000Z",
                  workShiftIds: ["shift-old", "other"],
                },
              ],
            },
          ]),
          update: setupUpdate,
        },
        workScheduleRequest: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: "request-1",
              scheduleDetails: [
                {
                  date: "2026-05-15T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
                {
                  date: "2026-05-18T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
              ],
            },
          ]),
          update: requestUpdate,
        },
      } as any),
    );

    const result = await workShiftService.update("shift-old", {
      name: "Hanh chinh moi",
    });

    expect(result).toBe(newShift);
    expect(update).toHaveBeenCalledWith({
      where: { id: "shift-old" },
      data: { isActive: false },
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "HC",
        name: "Hanh chinh moi",
        isActive: true,
      }),
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        workShiftId: "shift-old",
        workSchedule: { date: { gt: todayStart } },
      },
      data: { workShiftId: "shift-new" },
    });
    expect(setupUpdate).toHaveBeenCalledWith({
      where: { id: "setup-1" },
      data: {
        scheduleDetails: [
          { date: "2026-05-15T00:00:00.000Z", workShiftIds: ["shift-old"] },
          { date: "2026-05-16T00:00:00.000Z", workShiftIds: ["shift-old"] },
          {
            date: "2026-05-17T00:00:00.000Z",
            workShiftIds: ["shift-new", "other"],
          },
        ],
      },
    });
    expect(requestUpdate).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: {
        scheduleDetails: [
          { date: "2026-05-15T00:00:00.000Z", workShiftIds: ["shift-old"] },
          { date: "2026-05-18T00:00:00.000Z", workShiftIds: ["shift-new"] },
        ],
      },
    });
  });

  it("soft-deletes a shift and removes it only from future schedules", async () => {
    const shift = {
      id: "shift-old",
      code: "HC",
      name: "Hanh chinh",
      startTime: "08:00",
      endTime: "17:00",
      isActive: true,
    };
    const update = jest.fn().mockResolvedValue({ ...shift, isActive: false });
    const deleteMany = jest.fn();
    const setupUpdate = jest.fn();

    prismaMock.workShift.findUnique.mockResolvedValue(shift);
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        workShift: { update },
        workScheduleShift: { deleteMany },
        workScheduleSetup: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: "setup-1",
              scheduleDetails: [
                {
                  date: "2026-05-15T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
                {
                  date: "2026-05-17T00:00:00.000Z",
                  workShiftIds: ["shift-old", "other"],
                },
                {
                  date: "2026-05-18T00:00:00.000Z",
                  workShiftIds: ["shift-old"],
                },
              ],
            },
          ]),
          update: setupUpdate,
        },
        workScheduleRequest: {
          findMany: jest.fn().mockResolvedValue([]),
          update: jest.fn(),
        },
      } as any),
    );

    await workShiftService.remove("shift-old");

    expect(update).toHaveBeenCalledWith({
      where: { id: "shift-old" },
      data: { isActive: false },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        workShiftId: "shift-old",
        workSchedule: { date: { gt: todayStart } },
      },
    });
    expect(setupUpdate).toHaveBeenCalledWith({
      where: { id: "setup-1" },
      data: {
        scheduleDetails: [
          { date: "2026-05-15T00:00:00.000Z", workShiftIds: ["shift-old"] },
          { date: "2026-05-17T00:00:00.000Z", workShiftIds: ["other"] },
        ],
      },
    });
  });

  it("keeps null values when updating a shift", async () => {
    const currentShift = {
      id: "shift-old",
      code: "HC",
      name: "Hanh chinh",
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      lateGracePeriod: 5,
      earlyLeaveGracePeriod: 5,
      checkInStartTime: "07:30",
      checkInEndTime: "08:30",
      checkOutStartTime: "16:30",
      checkOutEndTime: "17:30",
      isOvertime: false,
      workUnits: 1,
      overtimeMultiplier: 1.5,
      isActive: true,
      createdAt: today,
      updatedAt: today,
    };
    const newShift = { ...currentShift, id: "shift-new", breakStartTime: null };
    const update = jest.fn();
    const create = jest.fn().mockResolvedValue(newShift);
    const updateMany = jest.fn();
    const setupUpdate = jest.fn();
    const requestUpdate = jest.fn();

    prismaMock.workShift.findUnique.mockResolvedValue(currentShift);
    prismaMock.workShift.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        workShift: { update, create },
        workScheduleShift: { updateMany },
        workScheduleSetup: {
          findMany: jest.fn().mockResolvedValue([]),
          update: setupUpdate,
        },
        workScheduleRequest: {
          findMany: jest.fn().mockResolvedValue([]),
          update: requestUpdate,
        },
      } as any),
    );

    await workShiftService.update("shift-old", { breakStartTime: null });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "HC",
        breakStartTime: null,
        breakEndTime: "13:00",
      }),
    });
  });
});
