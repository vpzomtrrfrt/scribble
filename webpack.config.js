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
			chunks: ['controller'],
			template: './template.html'
		}),
		new HtmlWebpackPlugin({
			filename: 'screen.html',
			chunks: ['screen'],
			template: './template.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.scss$/,
				use: [
					{loader: 'style-loader'},
					{loader: 'css-loader'},
					{loader: 'sass-loader'}
				]
			}
		]
	},
	resolve: {
		extensions: [".js", ".jsx"]
	}
};
