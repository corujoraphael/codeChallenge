var DataBaseConnection = require("./DataBaseConnection.js");
var _ = require('lodash');
var dayjs = require( 'dayjs' );
function Model(args) {

	var table = args.table;
	var id_field = args.id_field;
	var soft_delete = args.soft_delete || false;

	this.set = function(data){
		for (var property in data) {
			if (this.hasOwnProperty(property)) {
				this[property] = data[property];
			}
		}
	};

	this.toJSON = function(){
		var json = {};
		for (var property in this) {
			if (this.hasOwnProperty(property)) {
				json[property] = this[property];
			}
		}
		return json;
	};

	function formatParams(obj){
		var objModel = {};
		for (var property in obj) {
			if (obj.hasOwnProperty(property)) {
				if(obj[property] !== null){
					if(obj[property] === 'NULL' || obj[property] === '')
						objModel[property] = null;
					else
						objModel[property] = obj[property];
				}
			}
		}
		return objModel;
	}

	function getProperties(obj){
		var arr = [];
		for(var property in obj)
			if (obj.hasOwnProperty(property))
				if(obj[property] !== null)
					arr.push(property);
		return arr;
	}

	function getValues(obj){
		var arr = [];
		for(var property in obj)
			if (obj.hasOwnProperty(property))
				if(obj[property] !== null){
					if(obj[property] == 'NULL')
						arr.push(null);
					else
						arr.push(obj[property]);
				}
		return arr;
	}

	function getCountValues(arr){
		var str = "";
		for(var i=1; i<=arr.length; i++){
			if(i < arr.length)
				str += '$'+i+', ';
			else
				str += '$'+i;
		}
		return str;
	}

	function formatUpdate(obj){
		var str = "";
		var count = 0;
		var total = _.size(obj);
		for (var property in obj) {
			count++;
			if (obj.hasOwnProperty(property)) {
				if(obj[property] !== null){
					if(obj[property] == 'NULL')
						str += property+"="+null;
					else
						str = typeof(obj[property] === 'string') ? 
								str + property+"='"+obj[property]+"'" : 
								str + property+"="+obj[property];
				}
				str = count == total ? str : str+",";
			}
		}
		return str;
	}

	const addslashes = str =>(str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');

	this.save = function(params){
		var mySelf 	= this;
		params 		= params || {};
		var success = params.success || function(){};
		var error 	= params.error || function(){};

		var connection = new DataBaseConnection().getConnection();
			var sql = null;
			if (mySelf[id_field]){

				mySelf.created_at = null;
				mySelf.updated_at = dayjs().format( 'YYYY-MM-DD HH:mm:ss' ) ;

				var query = connection.query("UPDATE "+table+" SET ? WHERE "+id_field+" = "+
					mySelf[id_field], formatParams(mySelf), function(err, result) {
						if (!result)
							return error(err);
						success(mySelf.toJSON());					  		
					}
				);
			}else{

				mySelf.created_at = dayjs().format( 'YYYY-MM-DD HH:mm:ss' ) ;
				mySelf.updated_at = dayjs().format( 'YYYY-MM-DD HH:mm:ss' ) ;

				var query = connection.query("INSERT INTO "+table+" SET ? ", 
					formatParams(mySelf), function(err, result) {
					if (!result)
						return error(err);
					else {
						mySelf[id_field] = result.insertId;
						success(mySelf.toJSON());
					} 
				});
			}
	};

	this.executeQuery = function(params){
		
		params 		= params || {};
		var success = params.success || function(){};
		var error 	= params.error || function(){};
		var query 	= params.query;
		
		var connection = new DataBaseConnection().getConnection();

			connection.query(query, function(err, result) {
				if (!err){
					if(result.rows) return success(result.rows);
					return success(result);
				}else
					error(err);
			});
	};
	
	function prepareWhereQuery(params){
	  var whereQuery = "";
	  for (var property in params) {
		  if (params.hasOwnProperty(property)) {
			  if(params[property] !== null){
				var key   = property;
				var value = params[property];
				whereQuery+=" AND "+key+" = "+value;
			  }
		  }
	  }
	  return whereQuery;
	}

	function prepareOrderQuery(params){
		var query = "";
		for (var property in params) {
		  if (params.hasOwnProperty(property)) {
			  if(params[property] !== null){
				var key   = property;
				var value = params[property];
				query = (query === "") ? " ORDER BY "+key+" "+value : query+=(", "+key+" "+value) ;
			  }
		  }
		}
		return query;
	}
	
	this.getBy = function(params){
		var success       	= params.success || function(){};
		var error 	      	= params.error || function(){};
		var queryParams   	= params.queryParams || {};
		var orderParams		= params.orderParams || {};
		
		var query = "SELECT * FROM "+table+" WHERE 1"+prepareWhereQuery(queryParams)+prepareOrderQuery(orderParams);
		this.executeQuery({
			query : query,
			success : success,
			error : error
		});
	};

	this.deleteById = function(params){
		var success       	= params.success || function(){};
		var error 	      	= params.error || function(){};

		var query = "UPDATE "+table+" SET deleted_at = '"+ dayjs().format( 'YYYY-MM-DD HH:mm:ss' ) +"' WHERE id="+params.id;

		if (!soft_delete)
			query = "DELETE FROM "+table+" WHERE id="+params.id;

		this.executeQuery({
			query : query,
			success : success,
			error : error
		});
	};

}

module.exports = Model;