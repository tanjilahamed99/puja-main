import API from "@/config/axios";

export const getMyCourses = () => {
  return API.get("/teacher/courses");
};

export const getCourseEnrollments = (courseId) => {
  return API.get(`/teacher/courses/${courseId}/enrollments`);
};

export const markAttendance = (courseId, data) => {
  // data: { date, records: [{ student, status }] }
  return API.post(`/teacher/courses/${courseId}/attendance`, data);
};

export const getAttendance = (courseId, params) => {
  // params: { date } (optional)
  return API.get(`/teacher/courses/${courseId}/attendance`, { params });
};

export const getMyFreeClasses = () => {
  return API.get("/teacher/free-classes");
};

export const getMyPujaBookings = () => {
  return API.get("/teacher/specific-puja/bookings");
};

export const completePujaBooking = (bookingId) => {
  return API.patch(`/teacher/specific-puja/bookings/${bookingId}/complete`);
};

export const getUpcomingSchedule = () => {
  return API.get("/teacher/schedule/upcoming");
};