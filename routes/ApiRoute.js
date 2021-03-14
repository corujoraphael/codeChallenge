var express 			= require('express');

var router  = express.Router();

function makeObject(req, res, query = false){
    return {
        data : query ? req.query : req.body,
        success : function(data){
            res.json(data);
        },
        error : function(error,code, data = null){
            res.status(code).json({error : error, data});
        }
    }
}

router.use(function timeLog(req, res, next) {
    next();
});

var TasksController = require('.././controller/TasksController.js');

router.get('/tasks', function(req, res){
    TasksController.getBy(makeObject(req, res, true));
});

router.post('/task', function(req, res) {
    TasksController.save(makeObject(req, res));
});

router.put('/task', function(req, res) {
    TasksController.update(makeObject(req, res));
});

router.delete('/tasks', function(req, res) {
    TasksController.delete(makeObject(req, res));
});

module.exports = router;