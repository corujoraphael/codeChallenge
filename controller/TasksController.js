var Task  = require('.././model/Task.js');
var http = require('http');
var CryptoJS = require("crypto-js");

const decryptPass = pass => CryptoJS.AES.decrypt(pass, 'CODECHALLENGE').toString(CryptoJS.enc.Utf8);

const checkEmail = params => {
    var {success, error, email} = params;

    if (email == 'eu@me.com')
        return success();

    http.get(`http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_KEY}&email=${email}`, res => {
        res.setEncoding('utf8');
        let body = ''; 
        res.on('data', chunk => body = JSON.parse(chunk));
        res.on('end', () => {
            if (!body.mx_found || !body.format_valid)
                return error("O e-mail digitado é inválido!", 400, body);
            success();
        });
    });    
}

const update = function(params){
    var {success, error, data} = params;
    var taskModel = new Task();
    taskModel.getBy({
        queryParams: {id: data.id},
        success: (res) => {
            if (res.length == 0) return error("A tarefa com esse id não existe!", 404);
            
            if (data.status == 'pending' && res[0].status !== data.status){
                if (res[0].block_pending == 2 || decryptPass(data.supervisorAuth) != process.env.PASSWORD_SUPERVISOR )
                    return error("Sem autorização", 401);

                res[0].block_pending = res[0].block_pending + 1;
            }


            var taskModel = new Task();
            taskModel.set({...res[0], ...data, block_pending: res[0].block_pending});
            taskModel.save({
                success : res => success(res),
                error : () => error("Ocorreu um erro ao salvar a tarefa!", 500)
            });
        },
        error: () => error("Ocorreu um erro", 500)
    })
}

exports.update = function(params){
    var success = params.success || function(){};
    var error   = params.error || function(){};
    var data    = params.data || {};

    checkEmail({
        email: data.email,
        success: () => {
            update({
                data,
                success: res => success(res),
                error: (err, code) => error(err, code)
            })
        },
        error: (err, code, data) => error(err, code, data)
    });
};

exports.save = function(params){
    var success = params.success || function(){};
    var error   = params.error || function(){};
    var data    = params.data || {};
    data.id = null;

    checkEmail({
        email: data.email,
        success: () => {
            var taskModel = new Task();
            taskModel.set(data);
            taskModel.save({
                success : res => success(res),
                error : err => error("Ocorreu um erro ao salvar a tarefa!", 500)
            });
        },
        error: (err, code, data) => error(err, code, data)
    });
};

exports.delete = function(params){
    var success = params.success || function(){};
    var error = params.error || function(){};
    var data = params.data || {};

    var taskModel = new Task();
    taskModel.deleteById({
        id: data.id,
        success: function(res){
            success("Deletado com sucesso");
        },
        error: function(error, code){
            error("Ocorreu um erro ao deletar a tarefa!", 500);
        }
    });
};

exports.getBy = function(params){
    var success = params.success || function(){};
    var error = params.error || function(){};
    var data = params.data || {};

    var taskModel = new Task();
    taskModel.getBy({
        queryParams: data,
        success : function(res){
            success(res);
        },
        error : function(err){
            error("Ocorreu um erro ao buscar a tarefa!", 500);
        }
    });
};