const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcrypt");

class User extends Model {
	async setPassword(password) {
		let saltRounds = 10;
		this.password_hash = await bcrypt.hash(password, saltRounds);
	}

	async checkPassword(password) {
		return await bcrypt.compare(password, this.password_hash);
	}
}

module.exports = (sequelize) => {
	User.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: true,
			},
			password_hash: {
				type: DataTypes.STRING(60),
				allowNull: false,
			},
			high_score: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			number_of_plays: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			total_points: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: "User",
			tableName: "users",
			timestamps: true,
		}
	);

	return User;
};