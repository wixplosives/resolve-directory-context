/** @type import('webpack').Configuration */
module.exports = {
  context: __dirname,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: '@ts-tools/webpack-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: {
      path: require.resolve('@file-services/path')
    }
  },
};
