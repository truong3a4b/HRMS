import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { UserRole } from "../generated/prisma/client";
import { env } from "../src/config/env";
import { PERMISSIONS } from "../src/constants/permissions";
//npx prisma db seed

async function main() {
  // 1. Tạo position đầu tiên
  const position = await prisma.position.upsert({
    where: { code: "HR_STAFF" },
    update: {},
    create: {
      name: "Chuyên viên nhân sự",
      code: "HR_STAFF",
    },
  });

  //Tạo vị trí giám đốc với tất cả quyền
  const directorPosition = await prisma.position.upsert({
    where: { code: "DIRECTOR" },
    update: {},
    create: {
      name: "Giám đốc",
      code: "DIRECTOR",
    },
  });

  // 3. Tạo permission
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { key: PERMISSIONS.POSITION_VIEW_LIST },
      update: {},
      create: {
        key: PERMISSIONS.POSITION_VIEW_LIST,
        name: "Xem vị trí công việc",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.POSITION_CREATE },
      update: {},
      create: {
        key: PERMISSIONS.POSITION_CREATE,
        name: "Tạo vị trí công việc",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.RECRUITMENT_VIEW_JOB },
      update: {},
      create: {
        key: PERMISSIONS.RECRUITMENT_VIEW_JOB,
        name: "Xem tin tuyển dụng",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.RECRUITMENT_MANAGE_JOB },
      update: {},
      create: {
        key: PERMISSIONS.RECRUITMENT_MANAGE_JOB,
        name: "Quản lý tin tuyển dụng",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.RECRUITMENT_CREATE_JOB },
      update: {},
      create: {
        key: PERMISSIONS.RECRUITMENT_CREATE_JOB,
        name: "Tạo tin tuyển dụng",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.RECRUITMENT_UPDATE_JOB },
      update: {},
      create: {
        key: PERMISSIONS.RECRUITMENT_UPDATE_JOB,
        name: "Cập nhật tin tuyển dụng",
      },
    }),
    prisma.permission.upsert({
      where: { key: PERMISSIONS.RECRUITMENT_CLOSE_JOB },
      update: {},
      create: {
        key: PERMISSIONS.RECRUITMENT_CLOSE_JOB,
        name: "Đóng tin tuyển dụng",
      },
    }),
  ]);

  const viewEmployee = permissions.find(
    (permission) => permission.key === PERMISSIONS.POSITION_VIEW_LIST,
  );

  const createEmployee = permissions.find(
    (permission) => permission.key === PERMISSIONS.POSITION_CREATE,
  );

  const recruitmentJobPermissions = permissions.filter((permission) =>
    [
      PERMISSIONS.RECRUITMENT_VIEW_JOB,
      PERMISSIONS.RECRUITMENT_MANAGE_JOB,
      PERMISSIONS.RECRUITMENT_CREATE_JOB,
      PERMISSIONS.RECRUITMENT_UPDATE_JOB,
      PERMISSIONS.RECRUITMENT_CLOSE_JOB,
    ].includes(permission.key as any),
  );

  // 4. Gán permission cho position
  await prisma.positionPermission.upsert({
    where: {
      positionId_permissionId: {
        positionId: position.id,
        permissionId: viewEmployee?.id as string,
      },
    },
    update: {},
    create: {
      positionId: position.id,
      permissionId: viewEmployee?.id as string,
    },
  });

  await prisma.positionPermission.upsert({
    where: {
      positionId_permissionId: {
        positionId: position.id,
        permissionId: createEmployee?.id as string,
      },
    },
    update: {},
    create: {
      positionId: position.id,
      permissionId: createEmployee?.id as string,
    },
  });

  for (const permission of recruitmentJobPermissions) {
    await prisma.positionPermission.upsert({
      where: {
        positionId_permissionId: {
          positionId: position.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        positionId: position.id,
        permissionId: permission.id,
      },
    });
  }

  // 5. Hash password
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  // 6. Tạo employee admin trước để có managerId cho department
  const adminEmployee = await prisma.employee.upsert({
    where: { employeeId: "ADMIN001" },
    update: {},
    create: {
      employeeId: "ADMIN001",
      name: "Nguyễn Xuân Trưởng",
      email: "admin@hrms.com",
      positionId: directorPosition.id,
      status: "WORKING",
    },
  });

  // 7. Tạo department đầu tiên với trưởng phòng bắt buộc
  const department = await prisma.department.upsert({
    where: { code: "HR" },
    update: {
      managerId: adminEmployee.id,
    },
    create: {
      name: "Phòng nhân sự",
      code: "HR",
      managerId: adminEmployee.id,
    },
  });

  await prisma.employee.update({
    where: { id: adminEmployee.id },
    data: { departmentId: department.id },
  });

  // 8. Tạo user admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@hrms.com" },
    update: {},
    create: {
      email: "admin@hrms.com",
      password: passwordHash,
      role: UserRole.ADMIN,
      employee: {
        connect: { id: adminEmployee.id },
      },
    },
  });

  // 9. Tạo employee đầu tiên
  const employee = await prisma.employee.upsert({
    where: { employeeId: "EMP001" },
    update: {},
    create: {
      employeeId: "EMP001",
      name: "Nguyễn Văn A",
      email: "employee@hrms.com",
      departmentId: department.id,
      positionId: position.id,
      status: "WORKING",
    },
  });

  const existingJobHistory = await prisma.employeeJobHistory.findFirst({
    where: { employeeId: employee.id, effectiveTo: null },
    select: { id: true },
  });

  if (!existingJobHistory) {
    await prisma.employeeJobHistory.create({
      data: {
        employeeId: employee.id,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        hireDate: employee.hireDate,
        salary: employee.salary,
        status: employee.status,
        effectiveFrom: employee.hireDate ?? employee.createdAt,
      },
    });
  }

  // 10. Tạo user cho employee
  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@hrms.com" },
    update: {},
    create: {
      email: "employee@hrms.com",
      password: passwordHash,
      role: UserRole.EMPLOYEE,
      employee: {
        connect: { id: employee.id },
      },
    },
  });

  void admin;
  void employeeUser;

  console.log("Seed thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
