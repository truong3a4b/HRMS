import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Start backfill JobApplication...");

  const applications = await prisma.jobApplication.findMany({
    where: {
      OR: [{ candidateName: null }, { candidateEmail: null }],
    },
    include: {
      candidate: true,
    },
  });

  console.log(`Found ${applications.length} records to update`);

  for (const app of applications) {
    await prisma.jobApplication.update({
      where: { id: app.id },
      data: {
        candidateAvatar: app.candidate.avatar,
        candidateName: app.candidate.fullName,
        candidateEmail: app.candidate.email,
        candidatePhone: app.candidate.phone,
        candidateCvUrl: app.candidate.cvUrl,
        candidateAddress: app.candidate.address,
        candidateBirthDate: app.candidate.dateOfBirth,
        candidateGender: app.candidate.gender,
      },
    });
  }

  console.log("Backfill completed!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
