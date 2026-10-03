import API from "@/config/axios";

export const getMyCourses = () => API.get("/teacher/courses");
export const getCourseLiveKitToken = (id) =>
  API.get(`/teacher/courses/${id}/livekit-token`);
export const getCourseEnrollments = (id) =>
  API.get(`/teacher/courses/${id}/enrollments`);
export const markAttendance = (id, data) =>
  API.post(`/teacher/courses/${id}/attendance`, data);
export const getAttendance = (id, params) =>
  API.get(`/teacher/courses/${id}/attendance`, { params });

export const getMyFreeClasses = () => API.get("/teacher/free-classes");

export const getUpcomingSchedule = () => {
  return API.get("/teacher/schedule/upcoming");
};

export const getMyPujaBookings = () => {
  return API.get("/teacher/specific-puja/bookings");
};

export const getMyPujaBooking = (id) => {
  return API.get(`/teacher/specific-puja/bookings/${id}`);
};

export const completePujaBooking = (bookingId) => {
  return API.patch(`/teacher/specific-puja/bookings/${bookingId}/complete`);
};

export const startFreeClassSession = (freeClassId) =>
  API.post(`/teacher/free-classes/${freeClassId}/start`);

export const endFreeClassSession = (freeClassId) =>
  API.post(`/teacher/free-classes/${freeClassId}/end`);

export const getPujaBookingLiveKitToken = (bookingId) =>
  API.get(`/teacher/specific-puja/bookings/${bookingId}/livekit-token`);

export const startPujaBooking = (bookingId) =>
  API.post(`/teacher/specific-puja/bookings/${bookingId}/start`);
