// 创建script标签加载coolMaster
window.coolMasterAddress  = "http://198.168.1.110:1997/scripts/cool-master/cool-master.js"
window.scriptTag = window.document.createElement('script')
scriptTag.src = window.coolMasterAddress
window.document.head.appendChild(scriptTag)
delete window.scriptTag
delete window.coolMasterAddress
window.addEventListener('DOMContentLoaded', function() {
        window.intvl = setInterval(function() {
          if (!window.coolMaster || !window.coolMaster.load) return
          clearInterval(window.intvl)
          delete window.intvl
          coolMaster.load()
        }, 1)
    })
