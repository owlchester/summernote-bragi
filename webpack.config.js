
const path = require( 'path' );

// common Configuration
const config = {

    // bundling mode
    mode: 'production',

    // file resolutions
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            Bricks: path.resolve(__dirname, 'src/Bricks/'),
            Utils: path.resolve(__dirname, 'src/Utils/')
        }
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: {
                    loader: 'ts-loader'
                },
                exclude: /node_modules/,
            }
        ]
    },

    devtool: 'source-map'
};

const bragiBrickConfig = { ...config, ...{
    name: "bragiBrick",
    entry: "./src/index.ts",
    output: {
        path: path.resolve( __dirname, '../kanka/public/vendor/summernote/plugin/kanka' ),
        filename: 'summernote-bragi-kanka.min.js',
    },
}};

const bragiModuleConfig = { ...config, ...{
    name: "bragiModule",
    entry: "./src/Module/index.ts",
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'module/index.js',
    },
}};

// Return Array of Configurations
module.exports = [
    bragiBrickConfig, bragiModuleConfig,
];