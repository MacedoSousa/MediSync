import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Users
  const passwordHash = await argon2.hash("medisync123");
  const [admin, doctorUser, patientUser] = await Promise.all([
    prisma.user.upsert({ where: { email: "admin@medisync.local" }, update: {}, create: { email: "admin@medisync.local", role: "ADMIN", name: "Admin", passwordHash } }),
    prisma.user.upsert({ where: { email: "doctor@medisync.local" }, update: {}, create: { email: "doctor@medisync.local", role: "DOCTOR", name: "Dra. Ana", passwordHash } }),
    prisma.user.upsert({ where: { email: "patient@medisync.local" }, update: {}, create: { email: "patient@medisync.local", role: "PATIENT", name: "João", passwordHash } }),
  ]);

  // Facility
  let clinic = await prisma.facility.findFirst({ where: { name: "Clínica MediSync" } });
  if (!clinic) {
    clinic = await prisma.facility.create({ data: { name: "Clínica MediSync", type: "CLINIC", address: "Rua A, 123", registrationNumber: "REG-123" } });
  }

  // Doctor and patient profiles
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: { userId: doctorUser.id, facilityId: clinic.id, specialization: "Clínico Geral", verificationStatus: "VERIFIED" },
  });
  await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: { userId: patientUser.id },
  });

  // Availability slots
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  await prisma.availabilitySlot.createMany({
    data: [
      { doctorId: doctor.id, facilityId: clinic.id, startsAt: start, endsAt: new Date(start.getTime() + 30 * 60000), capacity: 1 },
      { doctorId: doctor.id, facilityId: clinic.id, startsAt: new Date(start.getTime() + 30 * 60000), endsAt: end, capacity: 1 },
    ],
    skipDuplicates: true,
  });

  // Exam types
  await prisma.examType.upsert({ where: { name: "Raio-X" }, update: {}, create: { name: "Raio-X", policy: "IN_PERSON_ONLY" } });
  await prisma.examType.upsert({ where: { name: "Teleconsulta Follow-up" }, update: {}, create: { name: "Teleconsulta Follow-up", policy: "ANY" } });
}

main().then(() => prisma.$disconnect());


