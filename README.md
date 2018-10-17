# [Webpack plugin] Dump Typescript Config into file system
A webpack plugin to dump compiled typescript config into file system. Is useful in case
you have resolve aliases formed dynamically and want your IDE to be able to handle them.

#### For webpack config file you can use [webpack-config-dump-plugin](https://www.npmjs.com/package/webpack-config-dump-plugin)

![MIT License](https://camo.githubusercontent.com/d59450139b6d354f15a2252a47b457bb2cc43828/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f7365727665726c6573732e737667)
[![Semver](http://img.shields.io/SemVer/1.1.2.png)](http://semver.org/spec/v1.1.2.html)

## Installation
```
npm i webpack-typescript-config-dump-plugin --save-dev
```

## Usage
```js
const TypescriptConfigDumpPlugin = require('webpack-typescript-config-dump-plugin')

// webpack config
{
  plugins: [
    new TypescriptConfigDumpPlugin(options)
  ]
}
```

### Options and defaults (Optional)
```js
{
  // Path to store config dump
  outputPath: './',

  // Config dump filename
  name: 'tsconfig.dump'
}
```
