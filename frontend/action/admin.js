import API from "@/config/axios";

// ---------------- Users ----------------

export const getUsers = (params) => {
  return API.get("/admin/users", { params });
};

export const getTeachers = () => {
  return API.get("/admin/users/teachers");
};

export const getUser = (id) => {
  return API.get(`/admin/users/${id}`);
};

export const createUser = (data) => {
  return API.post("/admin/users", data);
};

export const updateUser = (id, data) => {
  return API.patch(`/admin/users/${id}`, data);
};

export const deleteUser = (id) => {
  return API.delete(`/admin/users/${id}`);
};

// ---------------- Courses ----------------

export const getCourses = () => {
  return API.get("/admin/courses");
};

export const getCourse = (id) => {
  return API.get(`/admin/courses/${id}`);
};

export const createCourse = (data) => {
  return API.post("/admin/courses", data);
};

export const updateCourse = (id, data) => {
  return API.patch(`/admin/courses/${id}`, data);
};

export const deleteCourse = (id) => {
  return API.delete(`/admin/courses/${id}`);
};

export const getCourseEnrollments = (id) => {
  return API.get(`/admin/courses/${id}/enrollments`);
};

export const completeEnrollment = (enrollmentId) => {
  return API.patch(`/admin/enrollments/${enrollmentId}/complete`);
};

// ---------------- Free Classes ----------------

export const getFreeClasses = () => {
  return API.get("/admin/free-classes");
};

export const getFreeClass = (id) => {
  return API.get(`/admin/free-classes/${id}`);
};

export const createFreeClass = (data) => {
  return API.post("/admin/free-classes", data);
};

export const updateFreeClass = (id, data) => {
  return API.patch(`/admin/free-classes/${id}`, data);
};

export const deleteFreeClass = (id) => {
  return API.delete(`/admin/free-classes/${id}`);
};

export const getFreeClassParticipants = (id) => {
  return API.get(`/admin/free-classes/${id}/participants`);
};

export const getFreeClassDonations = (id) => {
  return API.get(`/admin/free-classes/${id}/donations`);
};

// ---------------- Specific Puja ----------------

export const getPujaPackages = () => {
  return API.get("/admin/specific-puja/packages");
};

export const createPujaPackage = (data) => {
  return API.post("/admin/specific-puja/packages", data);
};

export const updatePujaPackage = (id, data) => {
  return API.patch(`/admin/specific-puja/packages/${id}`, data);
};

export const deletePujaPackage = (id) => {
  return API.delete(`/admin/specific-puja/packages/${id}`);
};

export const getPujaBookings = () => {
  return API.get("/admin/specific-puja/bookings");
};

export const updatePujaBooking = (id, data) => {
  return API.patch(`/admin/specific-puja/bookings/${id}`, data);
};

// ---------------- Payments & Donations ----------------

export const getPayments = () => {
  return API.get("/admin/payments");
};

export const getPaymentSummary = () => {
  return API.get("/admin/payments/summary");
};

export const getDonations = () => {
  return API.get("/admin/payments/donations");
};

// ---------------- Dashboard ----------------

export const getDashboardStats = () => {
  return API.get("/admin/dashboard/stats");
};

export const getRecentEnrollments = () => {
  return API.get("/admin/dashboard/recent-enrollments");
};

export const getUpcomingSessions = () => {
  return API.get("/admin/dashboard/upcoming-sessions");
};