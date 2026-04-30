"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require a valid token
router.use(auth_1.protect);
// ─── Stats (role-scoped — each role sees only their tier and below) ────────────
router.get('/stats', auth_1.seniorStaff, admin_controller_1.getStatsHandler);
// ─── Governments ──────────────────────────────────────────────────────────────
// Only super admin can create / read government entities
router.post('/governments', auth_1.superAdminOnly, admin_controller_1.createGovernmentHandler);
router.get('/governments', auth_1.superAdminOnly, admin_controller_1.getGovernmentsHandler);
router.get('/governments/:id', auth_1.superAdminOnly, admin_controller_1.getGovernmentHandler);
// ─── LGAs ─────────────────────────────────────────────────────────────────────
// Super admin or government can create LGAs; management tier can read
router.post('/lgas', auth_1.superAdminOrGov, admin_controller_1.createLGAHandler);
router.get('/lgas', auth_1.managementTier, admin_controller_1.getLGAsHandler);
router.get('/lgas/:id', auth_1.managementTier, admin_controller_1.getLGAHandler);
// ─── Unions ───────────────────────────────────────────────────────────────────
// Government, LGA, or super admin can create unions; senior staff can read
router.post('/unions', auth_1.managementTier, admin_controller_1.createUnionHandler);
router.get('/unions', auth_1.seniorStaff, admin_controller_1.getUnionsHandler);
router.get('/unions/:id', auth_1.seniorStaff, admin_controller_1.getUnionHandler);
// ─── Sellers ──────────────────────────────────────────────────────────────────
// Union (and above) can register sellers
router.post('/sellers', auth_1.seniorStaff, admin_controller_1.createSellerHandler);
router.get('/sellers', auth_1.seniorStaff, admin_controller_1.getSellersHandler);
// ─── Riders ───────────────────────────────────────────────────────────────────
// Union (and above) can register riders
router.post('/riders', auth_1.seniorStaff, admin_controller_1.createRiderHandler);
router.get('/riders', auth_1.seniorStaff, admin_controller_1.getRidersHandler);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map