const path = require('path')
const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

module.exports = (() => {
	return {
		entry: slsw.lib.entries,
		externals: [nodeExternals()],
		target: 'node',
		stats: 'minimal',
		mode: slsw.lib.webpack.isLocal ? 'development': 'production',
		optimization: {
			minimize: false
		},
		performance: {
			hints: false
		},
		resolve: {
			extensions: ['.js']
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					}
				}
			]
		},
		output: {
			libraryTarget: 'commonjs',
			path: path.resolve(__dirname, '.webpack/'),
			filename: '[name].js',
		},
		plugins: [
			new CleanTerminalPlugin(),
			new FriendlyErrorsWebpackPlugin(),
		]
	}
})()
