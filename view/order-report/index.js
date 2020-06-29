var isArrOrObj = function(obj) {
  if (Array.isArray)
    return Array.isArray(obj);
  else
    return Object.prototype.toString.call(obj) === "[object Array]";
}

var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    labelWidth: '110px',
    size: 'small',
    queryCondition: {},
    condition: [],
    validData: [],
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    for(let item in this.queryCondition) {
      if(this.queryCondition[item].form == 'date') {
        console.log(this.queryCondition[item].name);
        let currentData =  dayjs().format("YYYY-MM-DD")
        let subtractData = dayjs().subtract(2,'month').format("YYYY-MM-DD")
        this.queryCondition[item].value[0] = subtractData;
        this.queryCondition[item].value[1] = currentData;
      }
    }
  },
  mounted() {
    //初始化axios的头部信息，使之携带token，每个有请求的页面都必须初始化
    // initial()
    //加载完才可见，谨防出现为渲染的难看的样式
    this.$el.style.visibility = 'visible'
    // 页面进入便查询
    this.updateCondition()
  },
  methods: {
    handleCommand(command) {
      command.mode.mode = command.data
      this.updateCondition()
    },
    updateCondition(value, label) {
      this.condition = []
      var obj = {}
      for (var prop in this.queryCondition) {
        this.condition.push(this.queryCondition[prop])
      }
      this.condition = this.condition.map(item => {
        let valueArray = []
        if (isArrOrObj(item.value)) {
          item.value.map((p, index) => {
            if (index == 1 && item.form == 'date' && p.length !== 0) valueArray.push({
              value: dayjs(p).add(1, 'day').format('YYYY-MM-DD')
            })
            else valueArray.push({
              value: p
            })
          })
        } else if (typeof(item.value) === 'string') {
          if (item.value.indexOf(',') != -1) {
            let newArr = item.value.split(',')
            newArr.map(p => {
              valueArray.push({
                value: p
              })
            })
          } else if (item.value.indexOf('，') != -1) {
            let newArr = item.value.split('，')
            newArr.map(p => {
              valueArray.push({
                value: p
              })
            })
          } else {
            valueArray.push({
              value: item.value
            })
          }
        } else if (typeof(item.value) === 'boolean') {
          valueArray.push({
            value: item.value
          })
        }
        return {
          "FieldName": item.fieldName,
          "TableName": item.tableName,
          "Value": valueArray,
          "TableRelationMode": item.tableRelationMode,
          "Mode": item.mode,
          "DataType": item.dataType
        }
      })
      this.validData = this.condition.filter(item => item.Mode != '不参与')
      console.log(this.validData, value, label, this.condition)
    },
    printData() {
      axiosDict[apiName].get(`Order/GetHdrPageList?page=1&size=1000000&condition=${JSON.stringify(this.validData)}`)
        .then(res => {
          console.log('查询结果', res)
          coolSti.view({
            token: token, //实际使用时请从window取值
            url: apiDict['system'] + 'coolSti',
            report: '订单报表',
            template: '默认',
            data: res.rows,
            variables: {
              Today: new Date()
            },
            pageTitle: '订单报表',
            isDirectEdit: false,
            onPrintReportName: 'onPrintReport',
            id: '订单报表',
          })
        })
    },
  }
})
