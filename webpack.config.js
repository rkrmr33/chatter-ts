module.exports = {
	mode: 'production',
	entry: './public/client/index.js',
	output: {
		path: `${__dirname}/static`,
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
};