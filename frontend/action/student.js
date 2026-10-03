import API from "@/config/axios";

// ---------------- Courses ----------------

export const browseCourses = () => API.get("/student/courses");
export const getMyCourse = (id) => API.get(`/student/courses/${id}`);
export const enrollInCourse = (id, data) =>
  API.post(`/student/courses/${id}/enroll`, data);
export const getCourseLiveKitToken = (id) =>
  API.get(`/student/courses/${id}/livekit-token`);
export const getMyEnrollments = () => API.get("/student/enrollments");

// ---------------- Free Classes ----------------

export const browseFreeClasses = () => API.get("/student/free-classes");

export const joinFreeClass = (freeClassId) =>
  API.post(`/student/free-classes/${freeClassId}/join`);

export const donateToFreeClass = (freeClassId, data) =>
  API.post(`/student/free-classes/${freeClassId}/donate`, data);

export const getFreeClass = (id) => API.get(`/student/free-classes/${id}`);
export const getFreeClassLiveKitToken = (id) =>
  API.get(`/student/free-classes/${id}/livekit-token`);
// ---------------- Specific Puja ----------------

export const browsePujaPackages = () =>
  API.get("/student/specific-puja/packages");

export const getPujaPackageSlots = (packageId) =>
  API.get(`/student/specific-puja/packages/${packageId}/slots`);

export const bookPujaPackage = (packageId, data) =>
  API.post(`/student/specific-puja/packages/${packageId}/book`, data);

export const getMyPujaBookings = () =>
  API.get("/student/specific-puja/bookings");

export const getPujaBookingLiveKitToken = (bookingId) =>
  API.get(`/student/specific-puja/bookings/${bookingId}/livekit-token`);

export const cancelPujaBooking = (bookingId) =>
  API.post(`/student/specific-puja/bookings/${bookingId}/cancel`);

export const getPujaBooking = (bookingId) =>
  API.get(`/student/specific-puja/bookings/${bookingId}`);

// ---------------- Certificates ----------------

export const getMyCertificates = () => API.get("/student/certificates");
