const router = require('express').Router();
const doctorController = require('../controllers/doctor.controller');
const appointmentController = require('../controllers/appointment.controller');

// Public doctor listing (only active doctors) for the patient portal.
router.get('/', doctorController.listActiveDoctors);
router.get('/:id', doctorController.getDoctor);
router.get('/:id/availability', appointmentController.getDoctorAvailability);
router.get('/:id/slots', appointmentController.getDoctorSlots);

module.exports = router;
