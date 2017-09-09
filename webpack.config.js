const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		controller: "./src/controller/index",
		screen: "./src/screen/index"
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].bundle.js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'controller.html',
			chunks: ['controller']
		}),
		new HtmlWebpackPlugin({
			filename: 'screen.html',
			chunks: ['screen']
		})
	]
};
