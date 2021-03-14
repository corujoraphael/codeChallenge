var Model = require("./Model.js");

function Task (){
	this.id 			         	= null;
	this.description				= null;
	this.name	 					= null;
	this.email  					= null;
	this.status  					= 'pending';
	this.block_pending				= 0;
	this.created_at 	 			= null;
	this.updated_at 	 			= null;
	this.deleted_at 	 			= null;
}

Task.prototype = new Model({
	table : "tasks",
	id_field : "id",
	soft_delete: true
});

module.exports = Task;
