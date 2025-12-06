import express from 'express';
import { getSales, getFilterOptions, getSuggestions } from '../controllers/salesController.js';

const router = express.Router();

router.get('/transactions', getSales);
router.get('/filter-options', getFilterOptions);
router.get('/suggestions', getSuggestions);

export default router;
