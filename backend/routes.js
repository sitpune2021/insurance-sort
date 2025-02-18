const { Router } = require("express");
const router = Router();

// Admin Login
const Login = require("./src/Controller/Login");
router.post("/checkLogin", Login.AdminLogin);

// Appointemnt API
const AdminAPI = require("./src/Controller/AppointmentAPI");
router.get("/getallappointment", AdminAPI.Get_ALL_APPOINTMENT);
router.get("/getallappointments", AdminAPI.Get_ALL_APPOINTMENTS);
router.get(
  "/gettodayappointmentdashboard",
  AdminAPI.GET_TODAY_APPOINTMENT_DASHBOARD
);
router.get(
  "/getAppointmentByStatus/:status",
  AdminAPI.GET_APPOINTMENT_BY_STATUS
);
router.get("/getlatestappointments", AdminAPI.GET_LATEST_APPOINTMENT);
router.get("/getAppointmentCount", AdminAPI.GET_APPOINTMENT_COUNT);
router.get("/getAssignedAppointmentCount", AdminAPI.GET_ASSIGN_COUNT);
router.get("/getUnassignedAppointmentCount", AdminAPI.GET_UNASSIGN_COUNT);
router.get("/getcompletedAppointmentCount", AdminAPI.GET_COMPLETED_COUNT);
router.put("/updateAppointment/:id", AdminAPI.UPDATE_APPOINTMENT);
router.get("/getAppointmentById/:id", AdminAPI.GET_APPOINTMENT_BY_ID);
router.post("/addAppointment", AdminAPI.ADD_APPOINTMENT);
router.get("/previewAppointments", AdminAPI.PREVIEW_APPOINTMENT);
router.get("/downloadAppointments", AdminAPI.DOWNLOAD_APPOINTMENT);
router.get("/getSubmittedAppointmentCount", AdminAPI.GET_SUBMITTED_APPOINTMENT_COUNT);
router.get("/getappointmentbypincode", AdminAPI.GET_APPOINTMENT_BY_PINCODE);
router.get("/getcentrebypincode", AdminAPI.GET_CENTRE_BY_PINCODE);
router.get("/getassistantbypincode", AdminAPI.GET_ASSISTANT_BY_PINCODE);

// Diagonasic Centre API
const DiagonasicCentreAPI = require("./src/Controller/DiagonasicCentreAPI");
router.get("/getAllLaboratories", DiagonasicCentreAPI.GET_ALL_LABORATORIES);
router.get("/getLaboratories", DiagonasicCentreAPI.GET_LABORATORIES);
router.get("/getLaboratoriesCount", DiagonasicCentreAPI.GET_LABORATORIES_COUNT);
router.get("/getLaboratoryById/:id", DiagonasicCentreAPI.GET_LABORATORY_BY_ID);
router.get("/downloadLaboratories", DiagonasicCentreAPI.DOWNLOAD_LABORAORY);
router.post("/addLaboratory", DiagonasicCentreAPI.ADD_LABORATORY);
router.put("/updateLaboratory/:id", DiagonasicCentreAPI.UPDATE_LABORATORY);
router.delete("/deleteLaboratory/:id", DiagonasicCentreAPI.DELETE_LABORATORY);
router.get("/getallappointmentforLaboratory", DiagonasicCentreAPI.GET_ALL_APPOINTMENT_FOR_LABORATORY);

// Technician API
const TechnicianAPI = require("./src/Controller/TechnicianAPI");
router.get(
  "/getallappointmentfortechnician",
  TechnicianAPI.GET_ALLAPPOINTMENT_FOR_TECHNICIAN
);
router.get(
  "/getAppointmentCountForAssistant",
  TechnicianAPI.GET_APPOINTMENT_COUNT_FOR_TECHNICIAN
);
router.get(
  "/getallappointmentforAssistant",
  TechnicianAPI.GET_ALL_APPOINTMENT_FOR_TECHNICIAN
);
router.get("/getAllassistant", TechnicianAPI.GET_ALL_ASSISTANT);
router.get("/getAssistants", TechnicianAPI.GET_ASSISTANT);
router.get("/getAssistantsCount", TechnicianAPI.GET_ASSISTANT_COUNT);
router.get("/getAssistantById/:id", TechnicianAPI.GET_ASSISTANT_BY_ID);
router.post("/addAssistant", TechnicianAPI.ADD_ASSISTANT);
router.put("/updateAssistant/:id", TechnicianAPI.UPDATE_ASSISTANT);
router.delete("/deleteAssistant/:id", TechnicianAPI.DELETE_ASSISTANT);
router.post("/assignTechnicians", TechnicianAPI.ASSIGN_TECHNICIAN);


// Sub-Admin API
const SubAdminAPI = require("./src/Controller/SubAdminAPI");
router.post("/assignToSubAdmin", SubAdminAPI.ASSIGN_TO_SUBADMIN);
router.get("/getAllSubadmin", SubAdminAPI.GET_ALL_SUBADMIN);
router.get("/getSubadminCount", SubAdminAPI.GET_SUBADMIN_COUNT);
router.get("/getSubadminById/:id", SubAdminAPI.GET_SUBADMIN_BY_ID);
router.post("/addSubadmin", SubAdminAPI.ADD_SUBADMIN);
router.put("/updateSubadmin/:id", SubAdminAPI.UPDATE_SUBADMIN);
router.delete("/deleteSubadmin/:id", SubAdminAPI.DELETE_SUBADMIN);
router.get("/getAllAssistantForSubadmin", SubAdminAPI.GET_ALL_ASSISTANT_FOR_SUBADMIN);
router.get("/getallappointmentforSubadmin", SubAdminAPI.GET_ALL_APPOINTMENT_FOR_SUBADMIN);
router.get("/getallappointmentDashboardforSubadmin", SubAdminAPI.GET_ALL_APPOINTMENT_OD_SUBADMIN_DASHBOARD);
router.get("/countAppointmentsForSubadmin", SubAdminAPI.GET_COUNT_ASSIGN_APPOINTMENT_OF_SUBADMIN);
router.get("/countUnassignedAppointmentsForSubadmin", SubAdminAPI.GET_COUNT_UNASSIGN_APPOINTMENT_OF_SUBADMIN);
router.get("/getAllAppointmentsSubAdmin/:subadmin_id", SubAdminAPI.GET_ALL_APPOINTMENT_BY_SUBADMIN_ID);


// Upload Report API
const UploadReportAPI = require("./src/Controller/UploadReportAPI");
router.get("/getAppointmentsToUploadReport", UploadReportAPI.GET_APPOINTMENT_TO_UPLOAD_REPORT);
router.get("/getAppointmentsAfterUploadReport", UploadReportAPI.GET_AFFOINTMENT_AFTER_UPLOAD_REPORT);
router.get("/getAppointmentsForAdminReport", UploadReportAPI.GET_APPOINTMENT_FOR_ADMIN_REPORT);
router.get("/getallappointmentreportforSubadmin", UploadReportAPI.GET_APPOINTMENT_REPORT_FOR_SUBADMIN);

// Profile API
const ProfileAPI = require("./src/Controller/ProfileAPI");
router.get("/getUserDetails", ProfileAPI.GET_USER_DETAILS);
router.get("/getAdressMasterDetails", ProfileAPI.GET_ADDRESS_DETAILS);
router.get("/getProfileById/:id", ProfileAPI.GET_PROFILE_BY_ID);
router.post("/saveProfile", ProfileAPI.SAVE_PROFILE);

const MobileAPP_API = require("./src/Controller/MobileApplicationAPI");
router.post("/checkLoginAssistant", MobileAPP_API.CHECK_LOGIN_ASSISTANT);
router.post("/updateFcmToken", MobileAPP_API.UPDATE_FCM_TOKEN);
router.get("/gettodayappointment", MobileAPP_API.GET_TODAY_APPOINTMENT);
router.get("/getscheduleappointment", MobileAPP_API.GET_SCHEDULE_APPOINTMENT);
router.get("/getpendingappointment", MobileAPP_API.GET_PENDING_APPOINTMENT);
router.get("/getassignappointment", MobileAPP_API.GET_ASSIGN_APPOINTMENT);
router.put("/updateAppointmentStatus/:id", MobileAPP_API.UPDATE_APPOINTEMNT_STATUS);
router.post("/sendOTP", MobileAPP_API.SEND_OTP);
router.post("/forgetPassword", MobileAPP_API.FORGET_PASSWORD);
router.get("/getassignappointmentfortechnician", MobileAPP_API.ASSIGN_APPOINTMENT_FOR_TECHNICIAN);
router.get("/getcompletedappointmentfortechnician", MobileAPP_API.COMPLETED_APPOINTMENT_FOR_TECHNICIAN);

module.exports = router;
