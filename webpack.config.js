const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const {UnusedFilesWebpackPlugin} = require('unused-files-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const Webpack = require("webpack");
const SMP = new SpeedMeasurePlugin();

module.exports = SMP.wrap({
    resolve: {alias: {vue: 'vue/dist/vue.esm.js'}},
    entry: {
        main: './resource/app.js',
        ui: './resource/ui.js',
        "lib/extender": './resource/lib/extender/extender.js'
    },
    output: {
        filename: './[name].js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader?name=/image/[name].[ext]'
            },
            {
                test: /\.vue$/,
                loader: ['vue-loader']
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [Autoprefixer()],
                            sourceMap: true
                        }
                    },
                    'sass-loader',
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.html$/,
                use: ['raw-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new Webpack.DefinePlugin({
            ENV: {
                VERSION: JSON.stringify(JSON.parse(Fs.readFileSync('package.json', 'utf-8'))['version'])
            }
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: false,
            template: 'resource/view/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new VueLoaderPlugin(),
        new CopyPlugin([
            {from: './resource/lib/vde.api.js', to: '../public/lib/vde.api.js'},
            {from: './resource/lib/vue.js', to: '../public/lib/vue.js'},
            {from: './resource/lib/vue.prod.js', to: '../public/lib/vue.prod.js'},
            {from: './resource/manifest.webmanifest', to: '../public/manifest.webmanifest'},
        ])
    ]
});