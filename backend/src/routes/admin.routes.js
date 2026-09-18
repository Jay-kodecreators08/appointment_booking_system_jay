const router = require('express').Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const doctorController = require('../controllers/doctor.controller');
const availabilityController = require('../controllers/availability.controller');
const breakController = require('../controllers/break.controller');
const appointmentController = require('../controllers/appointment.controller');
const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const { doctorValidator } = require('../validators/doctorValidators');
const { availabilityValidator } = require('../validators/availabilityValidators');
const { breakValidator } = require('../validators/breakValidators');

router.use(authenticateToken, requireAdmin);

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const data = await dashboardService.getAdminDashboard();
    res.status(200).json({ success: true, message: 'Dashboard fetched.', data });
  })
);

router.get('/doctors', doctorController.listDoctors);
router.post('/doctors', doctorValidator, validate, doctorController.createDoctor);
router.get('/doctors/:id', doctorController.getDoctor);
router.put('/doctors/:id', doctorController.updateDoctor);
router.delete('/doctors/:id', doctorController.deactivateDoctor);
router.patch('/doctors/:id/activate', doctorController.activateDoctor);

router.get('/availability', availabilityController.listAvailability);
router.post('/availability', availabilityValidator, validate, availabilityController.setAvailability);
router.put('/availability/:id', availabilityController.updateAvailability);
router.delete('/availability/:id', availabilityController.deleteAvailability);

router.get('/breaks', breakController.listBreaks);
router.post('/breaks', breakValidator, validate, breakController.createBreak);
router.put('/breaks/:id', breakValidator, validate, breakController.updateBreak);
router.delete('/breaks/:id', breakController.deleteBreak);

router.get('/appointments', appointmentController.adminListAppointments);

module.exports = router;
