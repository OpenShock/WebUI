const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const enc = new TextDecoder("utf-8");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const commitHash = enc.decode(require('child_process').execSync('git rev-parse HEAD')).replace('\n', '');

module.exports = (env) => {
	
	const targetEnv = env.TARGET_ENV === undefined ? process.env.TARGET_ENV : env.TARGET_ENV;
	console.log("Compiling with TARGET_ENV = " + targetEnv);

	return { 
		entry: {
			main: "./src/main.js",
		},
		output: {
			filename: "[name].[contenthash:8].js",
			path: path.resolve(__dirname, "dist"),
			chunkFilename: "[name].[contenthash:8].js"
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
					},
				},
				{
					test: /\.vue$/,
					loader: "vue-loader",
				},
				{
					test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
					loader: "file-loader",
					options: {
						name: "[name][contenthash:8].[ext]",
					},
				},
				{
					test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
					loader: "file-loader",
					options: {
						name: "[name][contenthash:8].[ext]",
						outputPath: "assets/img",
						useRelativePaths: true
					},
				},
				{
					test: /\.s?css$/,
					use: [
						"style-loader",
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								esModule: false,
							},
						},
						"css-loader",
						"postcss-loader",
						"sass-loader",
					],
				},
			],
		},
		plugins: [
			new CopyWebpackPlugin({'patterns': [
				{from:'./src/static/images', to:'static/images'}
			]}),
			new VueLoaderPlugin(),
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: "[name].[contenthash:8].css",
				chunkFilename: "[name].[contenthash:8].css",
			}),
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, "public", `index.${targetEnv === 'container' ? 'container' : 'shocklink'}.html`),
				favicon: "./public/favicon.ico",
				inject: true
			}),
			new webpack.DefinePlugin({
				'process.env': {
					'COMMIT_HASH': JSON.stringify(commitHash),
					'TARGET_ENV': JSON.stringify(targetEnv)
				}
			})
		],
		resolve: {
			extensions: ['', '.js', '.vue'],
			alias: {
				'vue': '@vue/runtime-dom',
				'vuex': 'vuex/dist/vuex.esm-bundler',
				'@': path.join(__dirname, 'src')
			}
		},
		optimization: {
			moduleIds: "deterministic",
			runtimeChunk: "single",
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						priority: -10,
						chunks: "all",
					},
				},
			},
		},
		devServer: {
			hot: true,
			allowedHosts: "all"
		}
	};
};