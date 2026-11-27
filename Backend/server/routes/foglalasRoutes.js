const express = require('express');
const foglalasController = require('../controllers/foglalasController');
const { validateCreateFoglalas, validateFoglalasStatusz } = require('../middlewares/validateFoglalas');

const router = express.Router();

router.get('/', foglalasController.getAll);
router.get('/:id', foglalasController.getById);
router.post('/', validateCreateFoglalas, foglalasController.create);
router.patch('/:id/statusz', validateFoglalasStatusz, foglalasController.updateStatus);
router.delete('/:id', foglalasController.remove);

module.exports = router;
