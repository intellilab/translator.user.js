// ==UserScript==
// @name translator
// @namespace https://lufei.so
// @grant GM_xmlhttpRequest
// @description 划词翻译
// @version 1.5.1
// ==/UserScript==

var sel, panel, audio, query

audio = document.createElement('audio')
audio.autoplay = true
function setStyle(el, o) {
    var x, arr = []
    var commonStyle = {
        lineHeight      : '24px',
        backgroundColor : '#fff',
        fontSize        : '13px',
        fontFamily      : 'monospace, consolas',
        textAlign       : 'left',
        wordBreak       : 'break-all',
        color           : '#555',
        padding         : '0',
        margin          : '0',
        boxSizing       : 'border-box'
    }
    o = o || {}
    function toLineThrough(s) {
        return s.replace(/[A-Z]/g, function(c) {
            return '-' + c.toLowerCase()
        })
    }
    for (x in commonStyle) {
        if (!o[x]) o[x] = commonStyle[x]
    }
    for (x in o) {
        arr.push(toLineThrough(x) + ': ' + o[x])
    }
    el.setAttribute('style', arr.join(';'))
}
function play(type) {
    audio.src = 'http://dict.youdao.com/dictvoice?audio=' + window.encodeURIComponent(query) + '&type=' + type
}
function htmlEntities(s) {
    var o = {
        '<': '&#60;',
        '>': '&#62;',
        '&': '&#38;',
        '"': '&#34;',
        "'": '&#39;'
    }
    return s.replace(/[<>&"]/g, function(c) {
        return o[c]
    })
}
function decode(o) {
    // variable
    var us, uk, x, i
    // element
    var header, explains, web, translation
    if (o.errorCode) return
    if (o.basic) {
        us = o.basic['us-phonetic'] || ''
        uk = o.basic['uk-phonetic'] || ''
        query = o.query || ''
        header = document.createElement('div')
        setStyle(header, {
            borderBottom    : '1px dashed #aaa !important',
            padding         : '0 0 8px'
        })
        header.innerHTML = '<span style="color: #333">' + htmlEntities(query) + '</span>' + '<span data-type="1" style="margin-left: .5rem; color: #7cbef0; cursor: pointer">uk:[' + uk + ']</span>' + '<span data-type="2" style="margin-left: .5rem; color: #7cbef0; cursor: pointer">us:[' + us + ']</span>'
        panel.appendChild(header)
        header.onclick = function(e) {
            if (e.target.dataset.type) play(e.target.dataset.type)
        }
        if (o.basic.explains) {
            explains = document.createElement('ul')
            setStyle(explains, {
                listStyle   : 'none',
                lineHeight  : '22px',
                margin      : '8px 0 0'
            })
            for (i = 0; i < o.basic.explains.length; i++) {
                x = document.createElement('li')
                setStyle(x)
                x.innerHTML = o.basic.explains[i]
                explains.appendChild(x)
            }
            panel.appendChild(explains)
        }
    } else if (o.translation) {
        translation = document.createElement('div')
        translation.innerHTML = o.translation[0]
        setStyle(translation)
        panel.appendChild(translation)
    }
}
panel = document.createElement('div')
setStyle(panel, {
    position        : 'fixed',
    borderRadius    : '4px',
    border          : '1px solid #eaeaea',
    maxWidth        : '300px',
    padding         : '8px',
    zIndex          : 999
})
document.addEventListener('mousedown', function(e) {
    if (e.buttons != 2) if (sel) sel.removeAllRanges()
})
document.addEventListener('mouseup', function(e) {
    var text
    sel = window.getSelection()
    text = sel.toString()
    if (e.target === panel || panel.contains(e.target)) return
    panel.innerHTML = ''
    if (panel && panel.parentElement) panel.parentElement.removeChild(panel)
    if (/^\s*$/.test(text)) return
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://fanyi.youdao.com/openapi.do?relatedUrl=http%3A%2F%2Ffanyi.youdao.com%2Fopenapi%3Fpath%3Dweb-mode&keyfrom=test&key=null&type=data&doctype=json&version=1.1&q=' + window.encodeURIComponent(text),
        onload: function(data) {
            data = JSON.parse(data.responseText)
            if (data.errorCode === 0) {
                var w = window.innerWidth,
                    h = window.innerHeight
                decode(data)
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
})
