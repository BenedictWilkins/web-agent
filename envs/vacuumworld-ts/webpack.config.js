const path = require( 'path' );
const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            "process.platform": JSON.stringify(process.platform)
        }),
    ],

    // bundling mode
    mode: 'production',

    // entry files
    entry: './src/main.ts',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'main.js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
        fallback: {
            "fs": false
        }
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};
