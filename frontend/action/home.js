import API from "@/config/axios";


export const browseFreeClasses = () => API.get("/home/free-classes");
export const browseCourses = () => API.get("/home/courses");
export const browsePujaPackages = () => API.get("/home/specific-puja/packages");