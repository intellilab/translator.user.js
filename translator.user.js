// ==UserScript==
// @name translator
// @namespace https://lufei.so
// @supportURL https://github.com/intellilab/translator.user.js
// @description 划词翻译
// @version 1.5.5
// @run-at document-start
// @grant GM_addStyle
// @grant GM_xmlhttpRequest
// ==/UserScript==

function play(query, type) {
  audio.src = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(query) + '&type=' + type
}
function htmlEntities(s) {
  var o = {
    '<': '&lt;',
    '&': '&amp;',
  }
  return s.replace(/[<&]/g, function (c) {
    return o[c]
  })
}
function render(o) {
  // variable
  var us, uk, x, i
  // element
  var header, explains, web, translation
  if (o.errorCode) return
  panelBody.innerHTML = ''
  if (o.basic) {
    us = htmlEntities(o.basic['us-phonetic'] || '')
    uk = htmlEntities(o.basic['uk-phonetic'] || '')
    query = o.query || ''
    header = document.createElement('div')
    header.className = randKey + ' ' + randKey + '-header'
    header.innerHTML =
      '<span style="color: #333">' + htmlEntities(query) + '</span>' +
      '<span data-type="1">uk:[' + uk + ']</span>' +
      '<span data-type="2">us:[' + us + ']</span>'
    panelBody.appendChild(header)
    header.addEventListener('click', function(e) {
      e.target.dataset.type && play(query, e.target.dataset.type)
    })
    if (o.basic.explains) {
      explains = document.createElement('ul')
      explains.className = randKey + ' ' + randKey + '-detail'
      for (i = 0; i < o.basic.explains.length; i++) {
        x = document.createElement('li')
        x.className = randKey
        x.innerHTML = o.basic.explains[i]
        explains.appendChild(x)
      }
      panelBody.appendChild(explains)
    }
  } else if (o.translation) {
    translation = document.createElement('div')
    translation.className = randKey
    translation.innerHTML = o.translation[0]
    panelBody.appendChild(translation)
  }
}
function translate(e) {
  var sel = window.getSelection()
  var text = sel.toString()
  if (/^\s*$/.test(text)) return
  if (['input', 'textarea'].indexOf(document.activeElement.tagName.toLowerCase()) < 0 && !document.activeElement.contains(window.getSelection().getRangeAt(0).startContainer)) return
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://fanyi.youdao.com/openapi.do?relatedUrl=http%3A%2F%2Ffanyi.youdao.com%2Fopenapi%3Fpath%3Dweb-mode&keyfrom=test&key=null&type=data&doctype=json&version=1.1&q=' + encodeURIComponent(text),
    onload: function (res) {
      var data = JSON.parse(res.responseText)
      var w = window.innerWidth, h = window.innerHeight
      if (!data.errorCode) {
        render(data)
        if (e.clientY > h * .5) {
          panel.style.top = 'auto'
          panel.style.bottom = h - e.clientY + 10 + 'px'
        } else {
          panel.style.top = e.clientY + 10 + 'px'
          panel.style.bottom = 'auto'
        }
        if (e.clientX > w * .5) {
          panel.style.left = 'auto'
          panel.style.right = w - e.clientX + 'px'
        } else {
          panel.style.left = e.clientX + 'px'
          panel.style.right = 'auto'
        }
        document.body.appendChild(panel)
      }
    }
  })
}

var panel, panelBody, panelPos, audio

audio = document.createElement('audio')
audio.autoplay = true

var randKey = 'it-' + Math.random().toString(16).slice(2, 8)
GM_addStyle(
  '.' + randKey + '{' + [
    'margin: 0',
    'padding: 0',
    'box-sizing: border-box',
  ].join(';') + '}' +
  '.' + randKey + '-panel{' + [
    'position: fixed',
    'max-width: 300px',
    'z-index: 10000',
  ].join(';') + '}' +
  '.' + randKey + '-body{' + [
    'position: relative',
    'padding: 8px',
    'border-radius: 4px',
    'border: 1px solid #eaeaea',
    'line-height: 24px',
    'color: #555',
    'background-color: #fff',
    'font-family: monospace, consolas',
    'font-size: 14px',
    'text-align: left',
    'word-break: break-all',
  ].join(';') + '}' +
  '.' + randKey + '-header{' + [
    'padding: 0 0 8px',
    'border-bottom: 1px dashed #aaa',
  ].join(';') + '}' +
  '.' + randKey + '-header>[data-type]{' + [
    'margin-left: 8px',
    'color: #7cbef0',
    'cursor: pointer',
    'font-size: 13px'
  ].join(';') + '}' +
  '.' + randKey + '-detail{' + [
    'margin: 8px 0 0',
    'line-height: 22px',
    'list-style: none',
    'font-size: 13px'
  ].join(';') + '}' + 
  '.' + randKey + '-detail>li{' + [
    'font-size: 13px',
    'line-height: 26px'
  ].join(';') + '}'
)
panel = document.createElement('div')
panel.className = randKey + ' ' + randKey + '-panel'
panelBody = document.createElement('div')
panelBody.className = randKey + ' ' + randKey + '-body'
panel.appendChild(panelBody)

document.addEventListener('mousedown', function (e) {
  if (panel.contains(e.target)) return
  panel.parentNode && panel.parentNode.removeChild(panel)
  panelBody.innerHTML = ''
}, true)
document.addEventListener('mouseup', function (e) {
  if (panel.contains(e.target)) return
  setTimeout(translate, 0, e)
}, true)
