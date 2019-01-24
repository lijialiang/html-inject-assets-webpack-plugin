const path = require('path')
const axios = require('axios')
const fs = require('fs')

const injectLinkElement = url => {
  switch (path.extname(url)) {
    case '.js':
      return `<script src="${url}"></script>`
    case '.css':
      return `<link rel="stylesheet" href="${url}">`
  }
}

const injectInlineElement = (url, data) => {
  switch (path.extname(url)) {
    case '.js':
      return `<script>${data}</script>`
    case '.css':
      return `<style type="text/css">${data}</style>`
  }
}

function HtmlInjectAssetsWebpackPlugin (options, { projectPath }) {
  const keys = Object.keys(options)
  const regKeys = {}

  keys.forEach((item, index) => {
    regKeys[item] = []
    regKeys[item].push(new RegExp(`<!--(\\s*)@inject/link:(\\s*)${item}(\\s*)-->`))
    regKeys[item].push(new RegExp(`<!--(\\s*)@inject/inline:(\\s*)${item}(\\s*)-->`))
  })

  this.replace = async function (htmlPluginData, callback) {
    let { html } = htmlPluginData

    for (const item of keys) {
      const regKey = regKeys[item]
      let value = options[item]

      for (const reg of regKey) {
        if (reg.test(html)) {
          const [match] = html.match(reg)

          if (match.indexOf('@inject/link') >= 0) {
            html = html.replace(match, injectLinkElement(value))
          } else {
            try {
              let data = ''

              if (value.indexOf('http') >= 0) {
                data = (await axios(value)).data
              } else {
                value = path.resolve(path.resolve(projectPath, 'src'), value)
                fs.existsSync(value) && (data = fs.readFileSync(value, 'utf8'))
              }

              data && (html = html.replace(match, injectInlineElement(value, data)))
            } catch (error) {
              throw error
            }
          }
        }
      }
    }

    htmlPluginData.html = html

    callback(null, htmlPluginData)
  }
}

HtmlInjectAssetsWebpackPlugin.prototype.apply = function (compiler) {
  compiler.hooks.compilation.tap('HtmlInjectAssetsWebpackPlugin', compilation => {
    if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('HtmlInjectAssetsWebpackPlugin', this.replace)
    } else {
      throw new Error('Please ensure that `html-webpack-plugin` was placed before `html-inject-assets-webpack-plugin` in your Webpack config')
    }
  })
}

module.exports = HtmlInjectAssetsWebpackPlugin
