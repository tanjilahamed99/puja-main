import API from "@/config/axios";

// ---------------- Courses ----------------

export const browseCourses = () => {
  return API.get("/student/courses");
};

export const enrollInCourse = (courseId, data) => {
  // data: { method, gatewayRef }
  return API.post(`/student/courses/${courseId}/enroll`, data);
};

export const getMyEnrollments = () => {
  return API.get("/student/enrollments");
};

// ---------------- Free Classes ----------------

export const browseFreeClasses = () => {
  return API.get("/student/free-classes");
};

export const joinFreeClass = (freeClassId) => {
  return API.post(`/student/free-classes/${freeClassId}/join`);
};

export const donateToFreeClass = (freeClassId, data) => {
  // data: { amount, method, gatewayRef }
  return API.post(`/student/free-classes/${freeClassId}/donate`, data);
};

// ---------------- Specific Puja ----------------

export const browsePujaPackages = () => {
  return API.get("/student/specific-puja/packages");
};

export const bookPujaPackage = (packageId, data) => {
  // data: { method, gatewayRef, participantInfo, preferredDateTime }
  return API.post(`/student/specific-puja/packages/${packageId}/book`, data);
};

export const getMyPujaBookings = () => {
  return API.get("/student/specific-puja/bookings");
};

// ---------------- Certificates ----------------

export const getMyCertificates = () => {
  return API.get("/student/certificates");
};