import express from 'express';
import { parseCoordinates, index } from '../controllers/WeatherController.js';
const router = express.Router();


router.get('/', parseCoordinates, index);

export default router;