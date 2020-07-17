const path = require('path');

module.exports = {
  optimization: {
    minimize: true
  },
  output: {
    path: path.resolve(__dirname, "public")
  }
  
}