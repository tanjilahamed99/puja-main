require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Enrollment = require("../src/models/Enrollment");
const Attendance = require("../src/models/Attendance");
const FreeClass = require("../src/models/FreeClass");
const FreeClassParticipant = require("../src/models/FreeClassParticipant");
const Donation = require("../src/models/Donation");
const SpecificPujaPackage = require("../src/models/SpecificPujaPackage");
const SpecificPujaBooking = require("../src/models/SpecificPujaBooking");
const Payment = require("../src/models/Payment");
const Certificate = require("../src/models/Certificate");

/* ------------------------------ time helpers ------------------------------ */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const now = () => Date.now();
const inMin = (m) => new Date(now() + m * MIN);
const inHours = (h) => new Date(now() + h * HOUR);
const inDays = (d) => new Date(now() + d * DAY);
const agoMin = (m) => new Date(now() - m * MIN);

function weekdayShort(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
}

function hhmm(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

/* ------------------------------ seed ------------------------------ */

const run = async () => {
  await connectDB();

  console.log("🧹  Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Attendance.deleteMany({}),
    FreeClass.deleteMany({}),
    FreeClassParticipant.deleteMany({}),
    Donation.deleteMany({}),
    SpecificPujaPackage.deleteMany({}),
    SpecificPujaBooking.deleteMany({}),
    Payment.deleteMany({}),
    Certificate.deleteMany({}),
  ]);

  /* ------------------------------ users ------------------------------ */

  console.log("👤  Creating users…");

  await User.create({
    name: "Admin User",
    email: "admin@gmail.com",
    password: "admin12",
    role: "admin",
  });

  const teacherSharma = await User.create({
    name: "Pandit R. Sharma",
    email: "r.sharma@sanatanpath.com",
    password: "Teacher@123",
    role: "teacher",
  });

  const teacherJoshi = await User.create({
    name: "Pandit K. Joshi",
    email: "k.joshi@sanatanpath.com",
    password: "Teacher@123",
    role: "teacher",
  });

  const teacherChatterjee = await User.create({
    name: "Pandit S. Chatterjee",
    email: "teacher@gmail.com",
    password: "teacher",
    role: "teacher",
  });

  const student1 = await User.create({
    name: "Ritika Sharma",
    email: "ritika@example.com",
    password: "Student@123",
    role: "student",
  });

  const student2 = await User.create({
    name: "Abir Hasan",
    email: "abir@example.com",
    password: "Student@123",
    role: "student",
  });

  const student3 = await User.create({
    name: "Priya Nair",
    email: "student@gmail.com",
    password: "student",
    role: "student",
  });

  /* ------------------------------ courses ------------------------------ */

  console.log("📚  Creating courses…");

  // --- Course A: ACTIVE, next session opens in ~2 min ---
  const openNowStart = inMin(2);

  const courseOpenNow = await Course.create({
    title: "Griha Pravesh Puja Basics",
    description:
      "Learn the essential rituals performed when moving into a new home.",
    category: "Griha Puja",
    price: 1499,
    teacher: teacherSharma._id,
    schedule: {
      days: [weekdayShort(openNowStart)],
      time: hhmm(openNowStart),
      timezone: "Asia/Dhaka",
    },
    liveKitRoomId: "course-griha-pravesh",
    status: "active",
    durationMinutes: 60,
    joinLeadMinutes: 5,
    joinGraceMinutes: 15,
    startDate: agoMin(60 * 24 * 7),
    endDate: inDays(60),
    totalSessions: 8,
  });

  // --- Course B: ACTIVE, next session tomorrow ---
  const tomorrow = inDays(1);
  const courseUpcoming = await Course.create({
    title: "Durga Puja Rituals for Families",
    description: "A complete guide to performing Durga Puja at home.",
    category: "Festival Puja",
    price: 1999,
    teacher: teacherJoshi._id,
    schedule: {
      days: [weekdayShort(tomorrow)],
      time: "19:00",
      timezone: "Asia/Dhaka",
    },
    liveKitRoomId: "course-durga-puja",
    status: "active",
    durationMinutes: 90,
    joinLeadMinutes: 10,
    joinGraceMinutes: 20,
    startDate: agoMin(60 * 24 * 3),
    endDate: inDays(45),
    totalSessions: 10,
  });

  // --- Course C: ACTIVE, session ended 3h ago ---
  const endedStart = agoMin(60 * 3);
  const courseEnded = await Course.create({
    title: "Everyday Puja & Aarti",
    description: "Daily rituals and aarti for a peaceful household.",
    category: "Everyday Rituals",
    price: 999,
    teacher: teacherChatterjee._id,
    schedule: {
      days: [weekdayShort(endedStart)],
      time: hhmm(endedStart),
      timezone: "Asia/Dhaka",
    },
    liveKitRoomId: "course-everyday-puja",
    status: "active",
    durationMinutes: 60,
    joinLeadMinutes: 5,
    joinGraceMinutes: 15,
    startDate: agoMin(60 * 24 * 30),
    endDate: inDays(30),
    totalSessions: 12,
    completedSessions: 4,
  });

  // --- Course D: DRAFT ---
  await Course.create({
    title: "Satyanarayan Puja Vidhi",
    description: "Step-by-step guidance for performing Satyanarayan Puja.",
    category: "Vedic Basics",
    price: 1299,
    teacher: teacherSharma._id,
    schedule: { days: ["Fri"], time: "17:00", timezone: "Asia/Dhaka" },
    liveKitRoomId: "course-satyanarayan",
    status: "draft",
    durationMinutes: 60,
    joinLeadMinutes: 10,
    joinGraceMinutes: 15,
  });

  /* ------------------------------ enrollments ------------------------------ */

  console.log("🎓  Creating enrollments + payments…");

  // --- Enrollment 1: active, session opening soon ---
  const pay1 = await Payment.create({
    user: student1._id,
    type: "subscription",
    course: courseOpenNow._id,
    amount: 1499,
    method: "phonepe",
    status: "success",
    gatewayRef: "PP-TEST-001",
  });
  await Enrollment.create({
    student: student1._id,
    course: courseOpenNow._id,
    payment: pay1._id,
    status: "active",
    startDate: agoMin(60 * 24 * 5),
    sessionsAttended: 3,
    sessionsMissed: 1,
    lastJoinedAt: agoMin(60 * 24 * 2),
  });

  // --- Enrollment 2: active, upcoming session tomorrow ---
  const pay2 = await Payment.create({
    user: student2._id,
    type: "subscription",
    course: courseUpcoming._id,
    amount: 1999,
    method: "paypal",
    status: "success",
    gatewayRef: "PP-TEST-002",
  });
  await Enrollment.create({
    student: student2._id,
    course: courseUpcoming._id,
    payment: pay2._id,
    status: "active",
    startDate: agoMin(60 * 24 * 2),
    sessionsAttended: 1,
    sessionsMissed: 0,
  });

  // --- Enrollment 3: COMPLETED with certificate ---
  const pay3 = await Payment.create({
    user: student3._id,
    type: "subscription",
    course: courseEnded._id,
    amount: 999,
    method: "phonepe",
    status: "success",
    gatewayRef: "PP-TEST-003",
  });

  // 1) Enrollment WITHOUT certificate first
  const enrollment3 = await Enrollment.create({
    student: student3._id,
    course: courseEnded._id,
    payment: pay3._id,
    status: "completed",
    startDate: agoMin(60 * 24 * 40),
    completedAt: agoMin(60 * 24 * 1),
    sessionsAttended: 12,
    sessionsMissed: 0,
  });

  // 2) Certificate referencing the enrollment
  const cert1 = await Certificate.create({
    student: student3._id,
    course: courseEnded._id,
    enrollment: enrollment3._id,
    certificateNumber: `CERT-${new Date().getFullYear()}-DEMO001`,
    issuedDate: agoMin(60 * 24 * 1),
  });

  // 3) Back-fill the enrollment's certificate reference
  enrollment3.certificate = cert1._id;
  await enrollment3.save();

  // --- Attendance records for the completed enrollment ---
  const attendanceDays = [5, 4, 3, 2, 1].map((d) => agoMin(60 * 24 * d));
  await Promise.all(
    attendanceDays.map((date) =>
      Attendance.create({
        course: courseEnded._id,
        student: student3._id,
        date,
        status: "present",
        markedBy: teacherChatterjee._id,
      }),
    ),
  );

  /* ------------------------------ free classes ------------------------------ */

  console.log("🕉️   Creating free classes…");

  // --- FreeClass A: live now (starts in 3 min) ---
  const freeOpenNow = await FreeClass.create({
    title: "Ganesh Puja Basics",
    description: "An introductory session open to everyone.",
    teacher: teacherSharma._id,
    dateTime: inMin(3),
    liveKitRoomId: "free-ganesh-puja",
    status: "scheduled",
    durationMinutes: 60,
    joinLeadMinutes: 5,
    joinGraceMinutes: 15,
    startedAt: new Date(),
  });

  await FreeClassParticipant.create({
    freeClass: freeOpenNow._id,
    user: student2._id,
    joinedAt: new Date(),
    lastJoinedAt: new Date(),
    joinCount: 1,
  });

  await Donation.create({
    user: student2._id,
    freeClass: freeOpenNow._id,
    amount: 500,
    method: "paypal",
    status: "success",
    gatewayRef: "DON-TEST-001",
  });

  // --- FreeClass B: upcoming (2 days out) ---
  await FreeClass.create({
    title: "Introduction to Mantras",
    description: "The meaning and pronunciation behind common mantras.",
    teacher: teacherChatterjee._id,
    dateTime: inDays(2),
    liveKitRoomId: "free-mantras-intro",
    status: "scheduled",
    durationMinutes: 45,
    joinLeadMinutes: 5,
    joinGraceMinutes: 10,
  });

  // --- FreeClass C: completed yesterday ---
  const freeEnded = await FreeClass.create({
    title: "Understanding Aarti",
    description: "What each aarti symbolizes and how to perform it correctly.",
    teacher: teacherJoshi._id,
    dateTime: agoMin(60 * 26),
    liveKitRoomId: "free-aarti",
    status: "completed",
    durationMinutes: 60,
    joinLeadMinutes: 5,
    joinGraceMinutes: 15,
    startedAt: agoMin(60 * 26),
    endedAt: agoMin(60 * 25),
  });

  await FreeClassParticipant.create({
    freeClass: freeEnded._id,
    user: student1._id,
    joinedAt: agoMin(60 * 26),
    lastJoinedAt: agoMin(60 * 26),
    joinCount: 1,
  });

  await FreeClassParticipant.create({
    freeClass: freeEnded._id,
    user: student3._id,
    joinedAt: agoMin(60 * 26),
    lastJoinedAt: agoMin(60 * 26),
    joinCount: 1,
  });

  await Donation.create({
    user: student1._id,
    freeClass: freeEnded._id,
    amount: 300,
    method: "phonepe",
    status: "success",
    gatewayRef: "DON-TEST-002",
  });

  /* ------------------------------ specific puja ------------------------------ */

  console.log("🔱  Creating specific puja packages + bookings…");

  const pkg1 = await SpecificPujaPackage.create({
    name: "Griha Shanti Puja",
    description:
      "A private puja performed for peace and protection in a household.",
    price: 2999,
    teacher: teacherSharma._id,
    requiredInfoFields: ["Full name", "Date of birth", "Nakshatra (if known)"],
    status: "active",
    durationMinutes: 60,
    minLeadTimeHours: 24,
    maxLeadTimeDays: 60,
    timezone: "Asia/Kolkata",
    availabilityNote: "Mornings 6–10 AM IST preferred",
    preferredDays: [1, 3, 5], // Mon, Wed, Fri
  });

  const pkg2 = await SpecificPujaPackage.create({
    name: "Personal Satyanarayan Puja",
    description:
      "A one-on-one Satyanarayan Puja conducted for a single family.",
    price: 3499,
    teacher: teacherJoshi._id,
    requiredInfoFields: ["Full name", "Family members present"],
    status: "active",
    durationMinutes: 90,
    minLeadTimeHours: 24,
    maxLeadTimeDays: 45,
    timezone: "Asia/Kolkata",
    availabilityNote: "Evenings 5–8 PM IST",
  });

  // --- Booking A: CONFIRMED, opens in ~2 min ---
  const pujaOpenStart = inMin(2);
  const payPuja1 = await Payment.create({
    user: student1._id,
    type: "specificPuja",
    amount: 2999,
    method: "phonepe",
    status: "success",
    gatewayRef: "PP-TEST-010",
  });
  await SpecificPujaBooking.create({
    package: pkg1._id,
    user: student1._id,
    payment: payPuja1._id,
    participantInfo: {
      "Full name": "Ritika Sharma",
      "Date of birth": "1995-03-12",
      "Nakshatra (if known)": "Rohini",
    },
    proposedDateTime: pujaOpenStart,
    confirmedDateTime: pujaOpenStart,
    scheduledDateTime: pujaOpenStart,
    durationMinutes: 60,
    liveKitRoomId: "puja-griha-shanti-001",
    status: "confirmed",
    confirmedBy: teacherSharma._id,
    confirmedAt: agoMin(60 * 12),
  });

  // --- Booking B: CONFIRMED, in 3 days ---
  const payPuja2 = await Payment.create({
    user: student2._id,
    type: "specificPuja",
    amount: 3499,
    method: "phonepe",
    status: "success",
    gatewayRef: "PP-TEST-011",
  });
  await SpecificPujaBooking.create({
    package: pkg2._id,
    user: student2._id,
    payment: payPuja2._id,
    participantInfo: {
      "Full name": "Abir Hasan",
      "Family members present": "4 members",
    },
    proposedDateTime: inDays(3),
    confirmedDateTime: inDays(3),
    scheduledDateTime: inDays(3),
    durationMinutes: 90,
    liveKitRoomId: "puja-satyanarayan-002",
    status: "confirmed",
    confirmedBy: teacherJoshi._id,
    confirmedAt: agoMin(60 * 6),
  });

  // --- Booking C: PENDING (admin must confirm) ---
  const payPuja3 = await Payment.create({
    user: student3._id,
    type: "specificPuja",
    amount: 2999,
    method: "paypal",
    status: "success",
    gatewayRef: "PP-TEST-012",
  });
  await SpecificPujaBooking.create({
    package: pkg1._id,
    user: student3._id,
    payment: payPuja3._id,
    participantInfo: {
      "Full name": "Priya Nair",
      "Date of birth": "1992-08-24",
      "Nakshatra (if known)": "Anuradha",
    },
    proposedDateTime: inDays(5),
    scheduledDateTime: inDays(5),
    durationMinutes: 60,
    status: "pending",
  });

  // --- Booking D: COMPLETED (in the past) ---
  const pastPujaStart = agoMin(60 * 24 * 10);
  const payPuja4 = await Payment.create({
    user: student1._id,
    type: "specificPuja",
    amount: 2999,
    method: "phonepe",
    status: "success",
    gatewayRef: "PP-TEST-013",
  });
  await SpecificPujaBooking.create({
    package: pkg1._id,
    user: student1._id,
    payment: payPuja4._id,
    participantInfo: {
      "Full name": "Ritika Sharma",
      "Date of birth": "1995-03-12",
      "Nakshatra (if known)": "Rohini",
    },
    proposedDateTime: pastPujaStart,
    confirmedDateTime: pastPujaStart,
    scheduledDateTime: pastPujaStart,
    durationMinutes: 60,
    liveKitRoomId: "puja-griha-shanti-000",
    status: "completed",
    confirmedBy: teacherSharma._id,
    confirmedAt: agoMin(60 * 24 * 12),
    startedAt: pastPujaStart,
    endedAt: new Date(pastPujaStart.getTime() + 60 * MIN),
  });

  /* ------------------------------ summary ------------------------------ */

  console.log("\n✅  Seed complete.\n");
  console.log("┌─────────────── Logins ───────────────");
  console.log("│ Admin    → admin@sanatanpath.com / Admin@123");
  console.log("│ Teacher  → r.sharma@sanatanpath.com / Teacher@123");
  console.log("│ Teacher  → k.joshi@sanatanpath.com / Teacher@123");
  console.log("│ Student  → ritika@example.com / Student@123");
  console.log("│ Student  → abir@example.com / Student@123");
  console.log("│ Student  → priya@example.com / Student@123");
  console.log("└──────────────────────────────────────");
  console.log("\nWhat to look for:");
  console.log("  • Course A       → join window OPEN NOW (~2 min away)");
  console.log("  • Course B       → join window ~1 day away");
  console.log("  • Course C       → completed + certificate issued");
  console.log("  • FreeClass A    → live, session started");
  console.log("  • FreeClass B    → upcoming (2 days)");
  console.log("  • FreeClass C    → completed yesterday");
  console.log("  • Puja Booking A → confirmed, opens in ~2 min");
  console.log("  • Puja Booking B → confirmed, in 3 days");
  console.log("  • Puja Booking C → pending (admin must confirm)");
  console.log("  • Puja Booking D → completed\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
