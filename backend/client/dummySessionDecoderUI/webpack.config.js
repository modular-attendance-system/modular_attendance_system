const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const deps = require('./package.json').dependencies;

module.exports = {
   entry: './src/index.js',
  mode: 'development',
  devServer: {
    port: 3000, // Port for the host application
    historyApiFallback: true, // Important for client-side routing
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // This enables CSS Modules
              modules: {
                // This setting provides more readable class names in development
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
      // New Rule for global CSS files (*.css, but not *.module.css)
      {
        test: /\.css$/,
        exclude: /\.module\.css$/, // Important: Exclude CSS module files from this rule
        use: ['style-loader', 'css-loader'], // Uses standard css-loader without modules option
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'sessionDecoderUI', // The unique global name
      filename: 'remoteEntry.js', // The entry point file
      exposes: {
        './SessionDecoderPanel': './src/SessionDecoderPanel', // Expose our component
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};