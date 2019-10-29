const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    resolve: {alias: {vue: 'vue/dist/vue.esm.js'}},
    entry: './resource/app.js',
    output: {
        filename: './bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                include: path.join(__dirname, 'img'),
                loader: 'url-loader?limit=30000&name=images/[name].[ext]'
            },
            {
                test: /\.vue$/,
                include: path.resolve(__dirname, 'resource/component'),
                loader: ['vue-loader']
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'resource/js'),
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    /*options: {
                        presets: 'env'
                    }*/
                }
            },
            {
                test: /\.scss$/,
                include: path.resolve(__dirname, 'resource'),
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?url=false', 'sass-loader']
                })
            },
            {
                test: /\.html$/,
                include: path.resolve(__dirname, 'resource/view'),
                use: ['raw-loader']
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'resource/view/index.html'
        }),
        new ExtractTextPlugin('style.css'),
        new VueLoaderPlugin()
    ]
};