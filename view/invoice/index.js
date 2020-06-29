function passSelection({
  to,
  data
}) {
  to = 'dialog1'
  console.log(1, 'passSelection')
  document.getElementById(to).contentWindow.postMessage({
    method: 'alertData',
    args: data
  }, '*')
  vm.dialogs[1].visible = !vm.dialogs[1].visible
}

function postSelection(args, source) {
  console.log(5, 'postSelection', args)
  let data = vm.currentHdrSelect
  source.postMessage({
    method: 'passSelection',
    args: {
      data: data,
      to: args.to
    }
  }, '*')
}
// function getSelection({ from, to }) {
//  console.log(2,'getSelection')
//  document.getElementById(from).contentWindow.postMessage({ method: 'postSelection', args: { to } }, '*')
//  }

var resourceName = 'Delivery'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // uniqueDeployKeyURL为前端已定义的变量 面的EmployeeInfo为后端模板生成的文件变量名 后面的为固定格式 需模板生成
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    // axiosSetting 固定格式 需模板生成生成
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    // cool-single-dialog组件的json文件名以及它的api名称 uniqueKeyURL为前端已定义的变量 后面的EmployeeInfo为后端模板生成的文件变量名
    isMethods: {
      isGetCondition: false,
      isTableSelectionChange: false,
      isTableRowClick: true,
    },
    // urlGetAllData: apiObject.orderURL + '/delivery/queryByPage',
    // urlGetHistory: apiObject.orderURL + '/delivery/history',
    backVisible: false,
    showQuery: true,
    hdrTableData: {},
    currentRow: undefined,
    currentformNo: undefined,
    buttons: [],
    uploadBtns: [],
    dialogs: [{
      top: '5vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      src: '',
      showSaveButton: true,
      saveBtnDisabled: true
    }, {
      top: '5vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      width: '90%',
      title: '选取订单木箱',
      src: '',
      showSaveButton: true
    }],
    currentHdrSelect: [],
    backItems: {}
  },
  created() {
    // console.log(window.coolLocals);
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }

    if (window.location.hash.split('#').find(p => p == 'beingSelectedPage')) this.buttons = this.buttons.splice(0, 2)
  },
  watch: {
    currentHdrSelect(val) {
      let text = ['查看', '编辑', '删除']
      text.forEach(t => {
        this.$refs.masterView.buttons.find(btn=>btn.text== t).disabled = val.length !== 1
      })
      this.$refs.masterView.buttons.find(btn=>btn.text== '提交').disabled = val.length !== 1 || val[0].status == '已审核'
      this.$refs.masterView.buttons.find(btn=>btn.text== '退回').disabled = val.length !== 1 || val[0].status == '到货确认'
    }
  },
  mounted() {
    axios.all([
      axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"发货类型"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
      .then(res => {
        this.$refs.masterView.queryCondition.type.options = res.map(p => ({
          value: p.name
        }))
      }),
      axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"物流公司"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
      .then(res => {
        this.$refs.masterView.queryCondition.logisticsCompany.options = res.map(p => ({
          value: p.name
        }))
      }),
      axiosDict['basic'].get(`Port/GetList?condition=[]`)
      .then(res => {
        this.$refs.masterView.queryCondition.exitPort.options = res.filter(p => p.type == '出关口岸').map(m => ({
          value: m.name
        }))

        this.$refs.masterView.queryCondition.arrivalPort.options = res.filter(p => p.type == '到港口岸').map(m => ({
          value: m.name
        }))
      })
    ])
    //初始化axios的头部信息，使之携带token，每个有请求的页面都必须初始化
    this.$el.style.visibility = 'visible'
    this.$refs.masterView.query()
  },
  methods: {
    hdrSelect(arg) {
      console.log('hdrSelect',arg);
      this.currentHdrSelect = arg
    },
    // 新增发货单弹窗

    //获取传出的查询参数
    getCondition(playload) {
      // this.condition = Object.assign(this.condition, playload)
    },
    //查询历史状态记录
    getHistory() {
      axiosDict[apiName].get(`History/GetList?condition=[{"FieldName": "code","TableName": "[InfoTable]","Value": [{"value": ${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode": "AND","Mode": "等于","DataType": "string"}]`)
      .then(res => {
        this.$refs.masterView.dtlTableData[0].data = res
      })
    },
    // 表格点击事件
    handleRowClick(arg) {
      if (arg !== undefined) {
        this.currentRow = arg
        this.currentformNo = arg.formNo
        console.log(this.currentRow)
        this.getHistory()
      }
    },
    paginationSizeChange(arg) {

    },
    paginationCurrentChange(arg) {

    },
    // 主表按钮组操作
    handleCheckBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `查看发货单`
      this.dialogs[0].src = `../invoice-manage/index.html#${token}#readonly#${this.currentHdrSelect[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleCreateBtn() {
      this.dialogs[0].showSaveButton = true
      this.dialogs[0].title = `新增发货单`
      this.dialogs[0].src = `../invoice-manage/index.html#${token}#new`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleEditBtn() {
      this.dialogs[0].showSaveButton = true
      this.dialogs[0].title = `编辑发货单`
      this.dialogs[0].src = `../invoice-manage/index.html#${token}#edit#${this.currentHdrSelect[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleSubmitBtn() {
      this.$confirm('确定提交？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].put(`Delivery/ConfirmHdr`,this.currentHdrSelect[0])
        .then(res => {
          this.successTips()
          this.$refs.masterView.query()
        })
      })
      .catch(() => {})
    },
    handleReturnBtn() {
      console.log(this.currentHdrSelect[0].status);
      this.backItems.form.find(p => p.label == '当前状态').value = this.currentHdrSelect[0].status
      this.backVisible = true
      // '/delivery/processReturn'
    },
    handlePrintBtn() {

    },
    successTips() {
      Vue.prototype.$notify.success({
        title: '操作成功',
        message: '操作成功',
        duration: 3000,
      })
    },
    handleBack() {
      let returnData = this.currentHdrSelect[0]
      returnData.returnReason = this.backItems.form.find(p => p.label == '退回原因').value
      axiosDict[apiName].put(`Delivery/ProcessReturn`, returnData)
        // {
          // this.currentHdrSelect[0],
          // status: this.backItems.form.find(p => p.label == '当前状态').value,
          // description: this.backItems.form.find(p => p.label == '退回原因').value
        // })
        .then(res => {
          this.successTips()
          this.backVisible = false
          this.$refs.masterView.query()
        })
    },
    clearDialogForm() {
      // this.$refs.backItems.resetForm()
      this.backItems.form.forEach(p => {
        p.value = ''
      })
      this.$refs.coolViews.$refs.tableView.clearSelectionOuter()
    },
    // iframe弹框操作
    dialogSaveEvent() {
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        if (this.dialogs.find(p => p.name == 'dialog2').visible == true) {
          // console.log(document.getElementById('dialog2').contentWindow);
          let to = 'dialog1'
          let secondDialog = document.getElementById('dialog2')
          secondDialog.contentWindow.postMessage({
            method: 'postSelection',
            args: {
              to
            }
          }, '*')
        } else {
          // console.log(document.getElementById('dialog1').contentWindow);
          document.getElementById('dialog1').contentWindow.vm.updateFullPage()
        }
      }
    },
    dialogBackEvent() {
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        return this.dialogs.find(p => p.name == 'dialog2').visible == true ? getDialog(this.dialogs, 'dialog2').visible = !getDialog(this.dialogs, 'dialog2').visible : getDialog(this.dialogs, 'dialog1').visible = !getDialog(this.dialogs, 'dialog1').visible
      }
    },
  }
})
