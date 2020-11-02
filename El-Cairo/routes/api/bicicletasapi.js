const express = require('express');
const router = express.Router();
const bicicletasController = require('../../controllers/api/bicicletasapicontroller');

router.get('/', bicicletasController.bicicleta_list);
router.post('/create', bicicletasController.bicicleta_create_post);
router.delete("/delete", bicicletasController.bicicleta_delete_post);
router.post('/update', bicicletasController.bicicleta_update_post);

module.exports = router;