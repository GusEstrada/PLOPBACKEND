import { Router } from 'express';
import { avatarCatalogController } from '../controllers/avatarCatalogController';

const router = Router();

router.get('/', avatarCatalogController.list);

export default router;
