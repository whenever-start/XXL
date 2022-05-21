// 写 webpack 配置时智能提示 (不知道为什么不生效)
/** @type {import('webpack').Configuration} */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',

  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // 生成的 bundle 文件用 function 函数而不是箭头函数
    // 因为这部分代码是 webpack 的, babel 无法处理, 导致低版本浏览器无法兼容, 所以需要关闭
    environment: {
      arrowFunction: false,
      const: false
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    // 浏览器版本
                    targets: {
                      chrome: '58',
                      ie: '11'
                    },
                    // core-js 版本
                    corejs: '3',
                    // 按需加载
                    useBuiltIns: 'usage'
                  }
                ]
              ]
            }
          },
          'ts-loader'
        ]
      },
      // 处理 less, loader 按顺序
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            // 兼容 (加前缀)
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      browsers: 'last 2 versions'
                    }
                  ]
                ]
              }
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico|mp3)/i,
        type: 'asset',
        generator: {
          // 图片局部目录
          filename: 'img/[hash][ext][query]'
        },
        // 设置大小 -> base64
        parser: {
          dataUrlCondition: {
            maxSize: 0
          }
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // favicon
      favicon: './favicon.ico'
    }),

    new CleanWebpackPlugin()
  ],

  resolve: {
    // import 的时候可以省略后缀
    extensions: ['.ts', '.js']
  }
}
