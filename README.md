# html-inject-assets-webpack-plugin

## Install

```sh
npm i html-inject-assets-webpack-plugin --save-dev

# or

yarn add html-inject-assets-webpack-plugin --dev
```

## How to use

```js
// webpack.config
module.exports = {
  plugin: [
    new HtmlWebpackPlugin(),
    new HtmlReplaceWebpackPlugin({
      a: 'https://a.com/a.css'
      b: 'https://b.com/b.js',
    })
  ]
}
```

## Example

```css
/* https://a.com/a.css */
html { background: red }
```

```js
// https://b.com/b.js
console.log('b')
```

### input

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <!-- @inject/link: a -->
  <!-- @inject/link: b -->

  <!-- @inject/inline: a -->
  <!-- @inject/inline: b -->
</body>
</html>
```

### output

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <link rel="stylesheet" href="https://a.com/a.css">
  <script src="https://b.com/b.js"></script>

  <style type="text/css">html { background: red }</style>
  <script>console.log('b')</script>
</body>
</html>
```
