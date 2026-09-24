require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const FreeClass = require('../src/models/FreeClass');
const FreeClassParticipant = require('../src/models/FreeClassParticipant');
const Donation = require('../src/models/Donation');
const SpecificPujaPackage = require('../src/models/SpecificPujaPackage');
const SpecificPujaBooking = require('../src/models/SpecificPujaBooking');
const Payment = require('../src/models/Payment');

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    FreeClass.deleteMany({}),
    FreeClassParticipant.deleteMany({}),
    Donation.deleteMany({}),
    SpecificPujaPackage.deleteMany({}),
    SpecificPujaBooking.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  console.log('Creating users...');
  await User.create({
    name: 'Tanjil Admin',
    email: 'admin@sanatanpath.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const teacherSharma = await User.create({
    name: 'Pandit R. Sharma',
    email: 'r.sharma@sanatanpath.com',
    password: 'Teacher@123',
    role: 'teacher',
  });

  const teacherJoshi = await User.create({
    name: 'Pandit K. Joshi',
    email: 'k.joshi@sanatanpath.com',
    password: 'Teacher@123',
    role: 'teacher',
  });

  const teacherChatterjee = await User.create({
    name: 'Pandit S. Chatterjee',
    email: 's.chatterjee@sanatanpath.com',
    password: 'Teacher@123',
    role: 'teacher',
  });

  const student1 = await User.create({
    name: 'Ritika Sharma',
    email: 'ritika@example.com',
    password: 'Student@123',
    role: 'student',
  });

  const student2 = await User.create({
    name: 'Abir Hasan',
    email: 'abir@example.com',
    password: 'Student@123',
    role: 'student',
  });

  const student3 = await User.create({
    name: 'Priya Nair',
    email: 'priya@example.com',
    password: 'Student@123',
    role: 'student',
  });

  console.log('Creating courses...');
  const course1 = await Course.create({
    title: 'Griha Pravesh Puja Basics',
    description: 'Learn the essential rituals performed when moving into a new home.',
    category: 'Griha Puja',
    price: 1499,
    teacher: teacherSharma._id,
    schedule: { days: ['Mon', 'Wed'], time: '18:00', timezone: 'Asia/Dhaka' },
    liveKitRoomId: 'course-griha-pravesh',
    status: 'active',
  });

  await Course.create({
    title: 'Durga Puja Rituals for Families',
    description: 'A complete guide to performing Durga Puja at home.',
    category: 'Festival Puja',
    price: 1999,
    teacher: teacherJoshi._id,
    schedule: { days: ['Tue', 'Thu'], time: '19:00', timezone: 'Asia/Dhaka' },
    liveKitRoomId: 'course-durga-puja',
    status: 'active',
  });

  const course3 = await Course.create({
    title: 'Everyday Puja & Aarti',
    description: 'Daily rituals and aarti for a peaceful household.',
    category: 'Everyday Rituals',
    price: 999,
    teacher: teacherChatterjee._id,
    schedule: { days: ['Sat'], time: '09:00', timezone: 'Asia/Dhaka' },
    liveKitRoomId: 'course-everyday-puja',
    status: 'active',
  });

  await Course.create({
    title: 'Satyanarayan Puja Vidhi',
    description: 'Step-by-step guidance for performing Satyanarayan Puja.',
    category: 'Vedic Basics',
    price: 1299,
    teacher: teacherSharma._id,
    schedule: { days: ['Fri'], time: '17:00', timezone: 'Asia/Dhaka' },
    liveKitRoomId: 'course-satyanarayan',
    status: 'draft',
  });

  console.log('Creating enrollments + payments...');
  const payment1 = await Payment.create({
    user: student1._id,
    type: 'subscription',
    course: course1._id,
    amount: 1499,
    method: 'phonepe',
    status: 'success',
    gatewayRef: 'PP-TEST-001',
  });
  await Enrollment.create({
    student: student1._id,
    course: course1._id,
    payment: payment1._id,
    status: 'active',
    startDate: new Date(),
  });

  const payment2 = await Payment.create({
    user: student3._id,
    type: 'subscription',
    course: course3._id,
    amount: 999,
    method: 'paypal',
    status: 'success',
    gatewayRef: 'PP-TEST-002',
  });
  await Enrollment.create({
    student: student3._id,
    course: course3._id,
    payment: payment2._id,
    status: 'pending',
    startDate: new Date(),
  });

  console.log('Creating free classes...');
  const freeClass1 = await FreeClass.create({
    title: 'Ganesh Puja Basics',
    description: 'An introductory session open to everyone.',
    teacher: teacherSharma._id,
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 5),
    liveKitRoomId: 'free-ganesh-puja',
    status: 'scheduled',
  });

  await FreeClassParticipant.create({ freeClass: freeClass1._id, user: student2._id });
  await Donation.create({
    user: student2._id,
    freeClass: freeClass1._id,
    amount: 500,
    method: 'paypal',
    status: 'success',
    gatewayRef: 'DON-TEST-001',
  });

  await FreeClass.create({
    title: 'Introduction to Mantras',
    description: 'The meaning and pronunciation behind common mantras.',
    teacher: teacherChatterjee._id,
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    liveKitRoomId: 'free-mantras-intro',
    status: 'scheduled',
  });

  console.log('Creating specific puja packages + bookings...');
  const pujaPkg1 = await SpecificPujaPackage.create({
    name: 'Griha Shanti Puja',
    description: 'A private puja performed for peace and protection in a household.',
    price: 2999,
    teacher: teacherSharma._id,
    requiredInfoFields: ['Full name', 'Date of birth', 'Nakshatra (if known)'],
    status: 'active',
  });

  const pujaPkg2 = await SpecificPujaPackage.create({
    name: 'Personal Satyanarayan Puja',
    description: 'A one-on-one Satyanarayan Puja conducted for a single family.',
    price: 3499,
    teacher: teacherJoshi._id,
    requiredInfoFields: ['Full name', 'Family members present'],
    status: 'active',
  });

  const pujaPayment1 = await Payment.create({
    user: student1._id,
    type: 'specificPuja',
    amount: 2999,
    method: 'phonepe',
    status: 'success',
    gatewayRef: 'PP-TEST-003',
  });

  await SpecificPujaBooking.create({
    package: pujaPkg1._id,
    user: student1._id,
    payment: pujaPayment1._id,
    scheduledDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    liveKitRoomId: 'puja-griha-shanti-001',
    status: 'confirmed',
  });

  const pujaPayment2 = await Payment.create({
    user: student2._id,
    type: 'specificPuja',
    amount: 3499,
    method: 'phonepe',
    status: 'pending',
    gatewayRef: 'PP-TEST-004',
  });

  await SpecificPujaBooking.create({
    package: pujaPkg2._id,
    user: student2._id,
    payment: pujaPayment2._id,
    scheduledDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    status: 'pending',
  });

  console.log('\nSeed complete.');
  console.log('Admin login   → admin@sanatanpath.com / Admin@123');
  console.log('Teacher login → r.sharma@sanatanpath.com / Teacher@123');
  console.log('Student login → ritika@example.com / Student@123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
