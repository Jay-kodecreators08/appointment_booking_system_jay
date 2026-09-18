const router = require('express').Router();
const { authenticateToken, requirePatient } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/appointment.controller');
const { createAppointmentValidator } = require('../validators/appointmentValidators');

router.use(authenticateToken, requirePatient);

router.post('/', createAppointmentValidator, validate, controller.createAppointment);
router.get('/my', controller.myAppointments);
router.get('/:id', controller.getAppointment);
router.patch('/:id/cancel', controller.cancelAppointment);

module.exports = router;
