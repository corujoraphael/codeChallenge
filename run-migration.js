var DataBaseConnection = require("./model/DataBaseConnection.js");

const runMigrations = async function (conn, migrations){
	for (let i =0 ; i < migrations.length; i++){
		conn.query(`SELECT * FROM migrations where name like '${migrations[i].name}' ORDER BY id DESC`, 
			async function (err, result){
				if (err) return console.log("ERROR");

				if (result.length == 0){
					await conn.query(migrations[i].query);
					await conn.query("INSERT INTO migrations SET name = \"" + migrations[i].name + "\"");
				}
			}
		);

		
	};
}

const migrate = async function (migrations){

	let conn = new DataBaseConnection().getConnection();
	
	var query = conn.query("SHOW TABLES LIKE 'migrations'", async function(err, result) {

		if (!err && result.length == 0)
			await conn.query("CREATE TABLE migrations ( id INT NOT NULL AUTO_INCREMENT , name TEXT NOT NULL, PRIMARY KEY (id))");

		runMigrations(conn, migrations);
	})
}

module.exports = migrate;