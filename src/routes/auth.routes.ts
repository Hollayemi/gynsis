import { Router } from 'express';
import {
  login,
  logout,
  refreshToken,
  getMe,
  updatePassword,
  registerGovernmentHandler,
  registerLGAHandler,
  registerUnionHandler,
  registerSellerHandler,
  registerRiderHandler,
} from '../controllers/auth.controller';
import { protect, governmentOnly, governmentOrLGA, managementOnly } from '../middleware/auth';
import {
  validateLogin,
  validateGovernmentRegister,
  validateLGARegister,
  validateUnionRegister,
  validateSellerRegister,
  validateRiderRegister,
  validateChangePassword,
} from '../helpers/validators/auth.validator';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────

router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// ─── Registration routes ──────────────────────────────────────────────────────
// Government: open (first-time seeding) or internally guarded at infra level
// LGA/Union/Seller: restricted so only higher-tier principals can onboard them
// Rider: done at the union post — union admins register riders

/**
 * Government registration
 * Typically called once per state during system setup. In production you may
 * want to restrict this behind an internal API key or remove it entirely after
 * initial seeding.
 */
router.post(
  '/register/government',
  validateGovernmentRegister,
  registerGovernmentHandler
);

/**
 * LGA registration
 * Only a Government account can register an LGA.
 */
router.post(
  '/register/lga',
  protect,
  governmentOnly,
  validateLGARegister,
  registerLGAHandler
);

/**
 * Union registration
 * Government or LGA accounts can register a union.
 */
router.post(
  '/register/union',
  protect,
  governmentOrLGA,
  validateUnionRegister,
  registerUnionHandler
);

/**
 * Ticket Seller registration
 * Government, LGA, or Union can register a seller (most common: union).
 */
router.post(
  '/register/seller',
  protect,
  managementOnly,
  validateSellerRegister,
  registerSellerHandler
);

/**
 * Rider registration (done at union post by union admin)
 * Government, LGA, or Union can register a rider.
 */
router.post(
  '/register/rider',
  protect,
  managementOnly,
  validateRiderRegister,
  registerRiderHandler
);

// ─── Protected routes ─────────────────────────────────────────────────────────

router.use(protect); // everything below requires auth

router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/change-password', validateChangePassword, updatePassword);

export default router;
