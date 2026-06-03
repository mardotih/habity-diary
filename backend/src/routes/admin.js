const router = require('express').Router();
const { getUsers, toggleUserStatus, changeUserRole, getAdminStats } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
