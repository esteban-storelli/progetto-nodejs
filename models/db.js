const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		dialect: "mysql",
		logging: false
	}
);

(async () => {
	try {
		await sequelize.sync({ alter: true });
		console.log("Database synced!");
	} catch (err) {
		console.error("DB sync error:", err);
	}
})();

(async () => {
	try {
		await sequelize.authenticate();
		console.log("Database connected!");
	} catch (err) {
		console.error("Connection failed:", err);
	}
})();


module.exports = sequelize;
