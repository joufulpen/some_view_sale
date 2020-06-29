function postSelection(args, source) {
  console.log(5, 'postSelection', args)
  let data = vm.currentRow
  source.postMessage({
    method: 'passSelection',
    args: {
      data: data,
      to: args.to
    }
  }, '*')
}

var resourceName = 'Order'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
// console.log(window.coolLocals)
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
      isTableRowClick: false,
    },
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '3vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      fullscreen: false,
      width: '90%',
      src: '',
      showSaveButton: true,
    }, {
      top: '3vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      fullscreen: false,
      width: '90%',
      src: ''
    }],

    showDtlTable: true,
    hdrTableData: {},
    dtlTableData: [],
    currentHdrSelection: [],

    printData: [],
    // 历史记录
    currentRow: undefined,
    // 订单收款
    dialogReceiptVisible: false,
    receiptFormItems: {},
    buttons: [],
    //收款按钮
    currentPaymentForm: [],
    // dialogLoading: false,
    // 新增发货单部分
    uploadDialogVisible: false,
    parentId: undefined,
    parentType: '订单',
    companyList: [],
    currentDtlTab: "",
    currentDtlSelection: [],
    receiptDialogTitle: "",
    customerDialogTitle:'新增',
    customerDialogTitleVisible:false,
    customerDialogFormItems:{},
  },
  computed: {
    beingSelected() {
      return window.location.hash.split('#').find(p => p == 'ApplyMaterial') ? true : false
    }
  },
  created() {
    // console.log(window.coolLocals);
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    // 表格数据格式化
    this.hdrTableData.columns.find(p => p.prop == "amount").formatter = numberToFixedFormatter
    this.dtlTableData[2].columns.find(p => p.prop == 'amount').formatter = numberToFixedFormatter
    this.dtlTableData[4].columns.find(p => p.type == "selection").selectable = (row, index) => {
      return row.status == "已确认" || row.status == "已出库" ? true : false
    }
    let woodenCaseFormat = ["length", "width", "height", "weigth"]
    woodenCaseFormat.forEach(p => {
      this.dtlTableData[4].columns.find(f => f.prop == p).formatter = numberToFixedFormatter
    })

    if (this.beingSelected) {
      this.$nextTick(() => {
        this.$refs.masterView.buttons = this.$refs.masterView.buttons.slice(0, 1)
        delete this.$refs.masterView.queryCondition.status
        this.$refs.masterView.query()
      })
    }
  },
  mounted() {
    this.$el.style.visibility = 'visible'
    if (!this.beingSelected) {
      axiosDict[apiName].get('Order/Status')
        .then(res => {
          this.$refs.masterView.queryCondition.status.options = res
        })
    }
    this.getCompany()
    this.getReceiptType()
  },
  watch: {
    currentRow(val) {
      this.$refs.masterView.dtlTableData[2].buttons.find(p => p.text == '新建').disabled = val == undefined
      // this.$refs.masterView.dtlTableData[3].buttons.find(p => p.text == '新建文件夹').disabled = val == undefined
      this.$refs.masterView.dtlTableData[3].buttons.find(p => p.text == '上传附件').disabled = val == undefined
      this.$refs.masterView.dtlTableData[4].buttons.find(p => p.text == '打印').disabled = val == undefined || this.$refs.masterView.dtlTableData[4].data.length == 0
      this.parentId = val == undefined ? undefined : val.formno
      this.$refs.masterView.dtlTableData[5].buttons.find(p => p.text == '新建').disabled = val == undefined
    },
    currentHdrSelection(val) {
      if (!this.beingSelected) {
        this.$refs.masterView.buttons.find(p => p.text == '报价单管理').disabled = val.length !== 1 || val[0].status == '订单终止'
        this.$refs.masterView.buttons.find(p => p.text == '编辑').disabled = val.length !== 1 || val[0].status == '订单终止'
        this.$refs.masterView.buttons.find(p => p.text == '删除').disabled = val.length !== 1 || val[0].status !== '订单创建'
        this.$refs.masterView.buttons.find(p => p.text == '打印').disabled = val.length !== 1 || val[0].status == '订单终止'
        this.$refs.masterView.buttons.find(p => p.text == '流程控制').disabled = val.length !== 1 || val[0].status == '订单终止'
      }
    },
    currentDtlSelection(val) {
      if (this.currentDtlTab == '订单收款') {
        this.$refs.masterView.dtlTableData[2].buttons.find(p => p.text == '编辑').disabled = val.length !== 1
        this.$refs.masterView.dtlTableData[2].buttons.find(p => p.text == '删除').disabled = val.length !== 1
      }
      if (this.currentDtlTab == '附件') {
        this.$refs.masterView.dtlTableData[3].buttons.find(p => p.text == '下载').disabled = val.length !== 1
        this.$refs.masterView.dtlTableData[3].buttons.find(p => p.text == '删除').disabled = val.length !== 1
      }
      if (this.currentDtlTab == '客户沟通信息') {
        this.$refs.masterView.dtlTableData[5].buttons.find(p => p.text == '编辑').disabled = val.length !== 1
        this.$refs.masterView.dtlTableData[5].buttons.find(p => p.text == '删除').disabled = val.length !== 1
      }
    },
  },
  methods: {
    uploadSuccess(response, attachment) {
      console.log('!!!UPLOAD-SUCCESS!!!');
      console.log(response);
      axiosDict[apiName].post(`InfoFile`, {
          description: response[0].description,
          extension: response[0].extension,
          name: response[0].name,
          code: response[0].parentID,
          fileType: "file",
          location: response[0].id,
          purpose: "fileInfoQuotation"
        })
        .then(res => {
          this.getUploadedData()
        })
    },
    updateReceiptForm(arg) {
      if (arg.name !== '' && arg.name !== this.currentPaymentForm.name) {
        this.receiptFormItems.form.find(p => p.label == "收款账号编号").value = ''
        let companyID = this.receiptFormItems.form.find(p => p.label == "公司名称").options.find(o => o.label == arg.name).id
        this.receiptFormItems.form.find(p => p.label == "收款账号编号").options = this.companyList.filter(o => (o.id == companyID)).map(m => ({
          label: m.defaultBankAccountID,
          value: m.defaultBankAccountID,
          receiptAccount: m.defaultBankAccountName
        }))
      }

      if (arg.receiptNumber !== '' && arg.receiptNumber !== this.currentPaymentForm.receiptNumber) {
        this.receiptFormItems.form.find(p => p.label == "收款账号名称").value = this.receiptFormItems.form.find(p => p.label == "收款账号编号").options.find(o => o.value == arg.receiptNumber).receiptAccount
      }

      this.currentPaymentForm = arg
    },
    //组合得出查询参数
    getCondition(playload) {
      // for (var prop in this.condition) {
      //   if (prop != 'current' && prop != 'offset') {
      //     delete this.condition[prop]
      //   }
      // }
      // this.condition = Object.assign(this.condition, playload)
      // if (this.beingSelected) this.condition.statusList = ['拆单审核', '计划待排', '生产中', '进仓', '生产完成', '发货', '订单完成']
    },

    formatList(arr) {
      arr.forEach(p => {
        p.des = p.attributes.des
        p.ref = p.attributes.ref
        p.partOL = p.attributes.partOL
        p.partOW = p.attributes.partOW
        p.partOT = p.attributes.partOT
        p.partL = p.attributes.partL
        p.partW = p.attributes.partW
        p.partT = p.attributes.partT
        if (p.children) {
          this.formatList(p.children)
        }
      })
    },
    tableSelectionChange(arg) {
      this.currentHdrSelection = arg
    },
    //点击行获得从表数据
    tableRowClick(arg) {
      this.currentRow = arg
      this.currentformNo = arg.formno
      if (!this.beingSelected) {
        this.getHistory(this.currentRow.formno)
        this.getReceiptData()
        this.getUploadedData()
        this.getContainerList()
        this.getPrintData()
        this.getCustomerInfo()
      }
    },
    //查询历史状态记录
    getHistory(arg) {
      axiosDict[apiName].get(`History/GetList?condition=[{"FieldName": "code","TableName": "[InfoTable]","Value": [{"value": ${JSON.stringify(arg)}}],"TableRelationMode": "AND","Mode": "等于","DataType": "string"}]`)
        .then(res => {
          console.log('历史信息', res);
          this.$refs.masterView.dtlTableData[1].data = res
        })
    },
    //获取收款数据
    getReceiptData() {
      axiosDict[apiName].get(`OrderReceipts/GetList?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`).then(res => {
        console.log('收款数据', res);
        this.$refs.masterView.dtlTableData[2].data = res
      })
    },
    // 获取附件列表
    getUploadedData() {
      axiosDict[apiName].get(`InfoFile/GetList?page=1&size=1000000&condition=[{"FieldName": "code","TableName": "[InfoTable]","Value": [{"value": ${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode": "AND","Mode": "等于","DataType": "string"}]`).then(res => {
        console.log('附件列表', res);
        this.$refs.masterView.dtlTableData[3].data = res

        // let directory = res.filter(p => p.name.split('\\').length == 1 && !p.name.includes('.'))
        // directory.forEach(p => p.children = [])
        // console.log(directory);
        // let subDirectory = res.filter(p => p.name.split('\\').length!==1)
        // subDirectory.forEach(p => {
        //   let lastIndex = p.name.lastIndexOf('\\')
        //   let preName = p.name.slice(0,lastIndex)
        //   console.log('hhhhhhhhhhhhh',preName);
        //   if(directory.find(d=>d.name == preName).children.indexOf(i => i === -1)) {
        //     directory.find(d=>d.name == preName).children.push(p)
        //   }
        //   // directory.indexOf()
        // })
        //
        // this.$refs.masterView.dtlTableData[3].data = directory
      })
    },
    // 获取木箱清单
    getContainerList() {
      axiosDict[apiName].get(`OrderContainer/GetList?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
        .then(res => {
          console.log('木箱清单', res)
          this.$refs.masterView.dtlTableData[4].data = res
        })
    },
    // 获取打印信息
    getPrintData() {
      axiosDict[apiName].get(`Order/GetBill?formno=${this.currentRow.formno}`)
        .then(res => {
          console.log('获取打印信息', res);
          this.printData = res
        })
    },
    // 获取客户沟通信息
    getCustomerInfo() {
      axiosDict[apiName].get(`OrderCustomer/GetList?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
        .then(res => {
          console.log('获取客户沟通信息',res);
          this.$refs.masterView.dtlTableData[5].data = res
        })
    },
    // 主表按钮操作
    handleCheckBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `查看项目订单`
      this.dialogs[0].src = `../project-order/index.html#${token}#${this.currentHdrSelection[0].pformno}#${this.dialogs[0].name}#${this.currentHdrSelection[0].formno}#readonly`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleEditBtn() {
      this.dialogs[0].showSaveButton = true
      this.dialogs[0].title = `编辑项目订单`
      this.dialogs[0].src = `../project-order/index.html#${token}#${this.currentHdrSelection[0].pformno}#${this.dialogs[0].name}#${this.currentHdrSelection[0].formno}#edit#${this.currentHdrSelection[0].status}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handlePrintBtn() {
      if (this.$refs.masterView.hdrTableData.data.length != 0) {
        coolSti.view({
          token: token, //实际使用时请从window取值
          url: apiDict['system'] + 'coolSti',
          report: '订单管理',
          template: '默认',
          data: this.printData,
          variables: {
            Today: new Date()
          },
          pageTitle: this.currentHdrSelection[0].formno + '订单',
          isDirectEdit: false,
          onPrintReportName: 'onPrintReport',
          id: this.currentHdrSelection[0].formno,
        })
      } else this.$message('无有效数据')
    },
    handleFlowControlBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `流程控制`
      this.dialogs[0].src = `../flow-control/index.html#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleQuotationBtn() {
      let orderData = JSON.parse(JSON.stringify(this.currentHdrSelection[0]))
      orderData.code = orderData.formno
      delete orderData.formno
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `报价单管理`
      this.dialogs[0].src = `../order-quotation/index.html#${token}#${this.currentHdrSelection[0].status}#${this.currentHdrSelection[0].formno}#${window.encodeURIComponent(JSON.stringify(orderData))}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handlePartBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `零部件`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.productionURL}/Part#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.productionURL}/Part#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleAluminumBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `铝材导入`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.productionURL}/Aluminum#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.productionURL}/Aluminum#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    customPartBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `定制部件导入`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.purchaseURL}CustomParts#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.purchaseURL}CustomParts#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleAccessoryBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `配件导入`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.productionURL}/Accessory#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.productionURL}/Accessory#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handlePackageBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `包装箱管理`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.encasementURL}package#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.encasementURL}package#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    handleWoodencaseBtn() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = `木箱管理`
      if (this.currentHdrSelection[0].status == '拆单处理') this.dialogs[0].src = `${serveDict.encasementURL}woodcase#${token}#${this.currentHdrSelection[0].formno}#拆单处理`
      else this.dialogs[0].src = `${serveDict.encasementURL}woodcase#${token}#${this.currentHdrSelection[0].formno}`
      getDialog(this.dialogs, 'dialog1').visible = true
    },
    paginationSizeChange(arg) {

    },
    paginationCurrentChange(arg) {

    },
    getCompany() {
      axiosDict['basic'].get(`Company/GetList?condition=[]`)
        .then(res => {
          console.log(res, this.receiptFormItems)
          this.companyList = res
          this.receiptFormItems.form.find(p => p.label == "公司名称").options = res.map(p => ({
            label: p.name,
            value: p.name,
            id: p.id
          }))
        })
    },
    getReceiptType() {
      axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"收款类型"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
        .then(res => {
          this.receiptFormItems.form.find(p => p.label == "收款类型").options = res.map(p => ({
            label: p.name,
            value: p.name,
          }))
        })
    },

    // 收款新建提交
    saveContactClick() {
      if (!this.$refs.receiptsForm.validateForm()) return
      // this.dialogLoading = true
      for (p in this.currentPaymentForm) {
        function isNumber(val) {
          var regPos = /^\d+(\.\d+)?$/; //非负浮点数
          if (regPos.test(val)) {
            return true;
          } else {
            return false;
          }
        }
        if (p == 'amount' && isNumber(this.currentPaymentForm[p]) != true) {
          this.$message.warning('收款金额格式有误')
          return
        }
      }
      this.currentPaymentForm.code = this.currentRow.formno
      if (this.receiptDialogTitle == "新增订单收款") {
        axiosDict[apiName].post('OrderReceipts', this.currentPaymentForm)
          .then(res => {
            this.getReceiptData()
            this.dialogReceiptVisible = false
            // this.dialogLoading = false
          })
      }
      if (this.receiptDialogTitle == "编辑订单收款") {
        // this.dialogLoading = true
        this.currentPaymentForm.id = this.currentDtlSelection[0].id
        this.currentPaymentForm.vs = this.currentDtlSelection[0].vs
        console.log(this.currentPaymentForm);
        axiosDict[apiName].put('OrderReceipts', this.currentPaymentForm)
          .then(res => {
            this.getReceiptData()
            this.dialogReceiptVisible = false
            // this.dialogLoading = false
          })
      }
    },
    clearReceiptsForm() {
      this.receiptFormItems.form.find(p => p.label == "收款账号编号").options = []
      this.currentPaymentForm = []
      this.receiptFormItems.form.forEach(p => {
        if (p.name != 'formno') {
          p.value = ''
        }
      })
      this.$nextTick(() => {
        this.$refs.receiptsForm.clearForm()
      })
    },
    iframeDialogBackEvent() {
      if (this.dialogs[0].title == '流程控制' || this.dialogs[0].title == '报价单管理') {
        // let condition = {
        //   createDate: ['', ''],
        //   deliveryDate: ['', ''],
        //   current: 1,
        //   offset: 100000000,
        //   customerName: '',
        //   customerOrderNo: '',
        //   engCode: '',
        //   projectName: '',
        //   status: '',
        //   formno: this.currentRow.formno
        // }
        // axiosDict[apiName].post(`/order/queryByPage`, condition)
        //   .then(res => {
        //     console.log('流程控制窗口关闭', res)
        //     let obj = this.HdrData.find(p=> p.formno == this.currentRow.formno)
        //     let newObj = res.rows[0]
        //     obj = Object.assign(obj,newObj)
        //   })
        axiosDict[apiName].get(`Order/GetHdr?formno=${this.currentHdrSelection[0].formno}`)
          .then(res => {
            console.log('流程控制窗口/报价单管理关闭', res)
            let obj = this.$refs.masterView.hdrTableData.data.find(p => p.formno == this.currentHdrSelection[0].formno)
            obj = Object.assign(obj, res)
            this.getHistory(this.currentHdrSelection[0].formno)
          })
      }
    },
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
          document.getElementById('dialog1').contentWindow.vm.projectSaveEvent()
        }
      }
    },
    dialogBackEvent() {
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        return this.dialogs.find(p => p.name == 'dialog2').visible == true ? getDialog(this.dialogs, 'dialog2').visible = !getDialog(this.dialogs, 'dialog2').visible : getDialog(this.dialogs, 'dialog1').visible = !getDialog(this.dialogs, 'dialog1').visible
      }
    },
    tabClick(tab, event) {
      console.log('tabClick', tab, event);
      this.currentDtlTab = tab.label
    },
    dltTableSelectionChange(arg) {
      console.log(arg)
      this.currentDtlSelection = arg
    },
    dltButtonsEvent(btnText, label) {
      console.log(btnText);
      if (this.currentDtlTab == '订单收款') {
        switch (btnText) {
          case '新建':
            {
              this.receiptDialogTitle = "新增订单收款"
              this.receiptFormItems.form[0].value = this.currentRow.formno
              this.dialogReceiptVisible = true
              break
            }
          case '编辑':
            {
              this.receiptDialogTitle = "编辑订单收款"
              this.receiptFormItems.form.forEach(p => {
                p.value = this.currentDtlSelection[0][p.name]
                this.currentPaymentForm[p.name] = this.currentDtlSelection[0][p.name]
              })
              this.dialogReceiptVisible = true
            }
            break
          case '删除':
            {
              axiosDict[apiName].delete(`OrderReceipts`, {
                data: this.currentDtlSelection[0]
              })
              .then(res => {
                this.getReceiptData()
              })
            }
          default:
            break
        }
      }
      if (this.currentDtlTab == '附件') {
        switch (btnText) {
          // case '新建文件夹':
          //   {
          //     this.$prompt(`请输入文件名`, `新建文件夹`, {
          //       confirmButtonText: '确定',
          //       cancelButtonText: '取消',
          //       closeOnClickModal: false,
          //       closeOnPressEscape: false,
          //       inputValidator: this.promptValidator
          //     }).then( arg =>{
          //       console.log('确认新建文件夹',arg);
          //       let name = arg.value
          //       if(!this.currentDtlSelection[0].name.includes('.')) {
          //         name = `${this.currentDtlSelection[0].name}\\${name}`
          //       }
          //       console.log('新建文件夹路径',name);
          //       axiosDict[apiName].post(`InfoFile`, {
          //           description: '',
          //           extension: '',
          //           name: name,
          //           code: this.currentRow.formno,
          //           fileType: "file",
          //           location: '',
          //           purpose: "fileInfoQuotation"
          //         })
          //         .then(res => {
          //           console.log(res);
          //           this.getUploadedData()
          //         })
          //     }).catch(()=> {
          //
          //     })
          //     break
          //   }
          case '上传附件':
            {
              this.uploadDialogVisible = true
              break
            }
          case '下载':
            {
              downloadFiles(this.currentDtlSelection[0].location)
              break
            }
          case '删除':
            {
              this.delUploaded()
              break
            }
          default:
            break
        }
      }
      if (this.currentDtlTab == '木箱清单' && btnText == '打印') {
        this.woodenCasePrint()
      }
      if(this.currentDtlTab == '客户沟通信息') {
        switch (btnText) {
          case '新建':
            {
              this.customerDialogTitle = '新增'
              this.customerDialogFormItems.form.find(p=>p.name == 'status').value = "进行中"
              this.customerDialogTitleVisible = true
              break
            }
          case '编辑':
            {
              this.customerDialogTitle = '编辑'
              this.customerDialogFormItems.form.map(item=>{
                for(let i in this.currentDtlSelection[0]){
                  if(i == item.name)item.value = this.currentDtlSelection[0][i]
                }
              })
              this.customerDialogTitleVisible = true
              break
            }
          case '删除':
            {
              this.$confirm('确定删除此项？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  axiosDict[apiName].delete(`OrderCustomer`,{
                    data: this.currentDtlSelection[0]
                  }).then(res => {
                    console.log('删除客户沟通信息',res);
                    this.getCustomerInfo()
                    // this.$refs.masterView.dtlTableData[5].data.splice(this.$refs.masterView.dtlTableData[5].data.indexOf(this.currentDtlSelection[0]), 1)
                  })
                })
                .catch(() => {})
              break
            }
          default:
            break
        }
      }
    },
    promptValidator(input) {
      let regex = /[\\/:*?"<>|]/
      let str = input.toString().trim()
      if (str.length == 0) {
        return `命名不能为空`
      } else if(regex.test(str)) {
        return `命名中含非法字符`
      }
      else return true
    },
    delUploaded() {
      this.$confirm('确定删除附件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          let ids = this.currentDtlSelection.map(p => p.id)
          let location = this.currentDtlSelection.map(p => p.location)
          console.log(ids);
          axiosDict[apiName].delete(`InfoFile`, {
              data: this.currentDtlSelection[0]
            })
            .then(data => {
              console.log(data);
              console.log('订单模块附件删除成功');
              axios.all(
                location.map(loc => {
                  return axiosDict['basic'].get('Attachment', {
                    params: {
                      id: loc
                    }
                  }).then(res => {
                    axiosDict['basic'].delete('Attachment', {
                        data: res
                      })
                      .then(del => {
                        console.log('单个基础模块附件删除成功');
                      })
                  })
                })
              ).finally(() => {
                console.log('附件删除流程结束，重新获取附件列表')
                this.getUploadedData()
              })
            })

        })
        .catch(() => {})
    },
    woodenCasePrint() {
      let woodenCasePrintData = this.currentDtlSelection.map(p => (JSON.parse(p.printData)))
      console.log('woodenCasePrintData', woodenCasePrintData);
      coolSti.view({
        token: token, //实际使用时请从window取值
        url: apiDict['system'] + 'coolSti',
        report: '木箱',
        template: '默认',
        data: {
          木箱: woodenCasePrintData
        },
        variables: {
          Today: new Date()
        },
        pageTitle: this.currentRow.formno + '木箱打印',
        isDirectEdit: false,
        onPrintReportName: 'onPrintReport',
        id: this.currentRow.formno,
      })
    },
    updateCutomerInfoForm(arg){
      console.log(arg)
      if(arg.status == "进行中") {
        this.customerDialogFormItems.form.find(p=>p.name == 'completeDate').value = ""
        arg.completeDate = ""
      }
      if(arg.status == "已完成") {
        this.customerDialogFormItems.form.find(p=>p.name == 'completeDate').value = dayjs().format('YYYY-MM-DDT12:00:00')
        arg.completeDate = dayjs().format('YYYY-MM-DDT12:00:00')
      }
      this.addTableData = arg
    },
    customerDialogSaveEvent() {
      if (!this.$refs.customerInfoForm.validateForm()) return
      this.addTableData.code = this.currentRow.formno
      if (this.customerDialogTitle == '新增') {
        axiosDict[apiName].post(`OrderCustomer`,this.addTableData)
          .then(res => {
            console.log('新增客户沟通信息',res);
            // this.$refs.masterView.dtlTableData[5].data.push(this.addTableData)
            this.getCustomerInfo()
          })
      }
      if (this.customerDialogTitle == '编辑') {
        let addTableData = Object.assign(this.currentDtlSelection[0],this.addTableData)
        axiosDict[apiName].put(`OrderCustomer`,addTableData)
          .then(res => {
            console.log('编辑客户沟通信息',res);
            this.getCustomerInfo()

            // this.$refs.masterView.dtlTableData[5].data[this.$refs.masterView.dtlTableData[5].data.indexOf(this.currentDtlSelection[0])] = Object.assign(this.$refs.masterView.dtlTableData[5].data[this.$refs.masterView.dtlTableData[5].data.indexOf(this.currentDtlSelection[0])], res)
          })
      }
      this.customerDialogBackEvent()
    },
    customerDialogBackEvent(){
        this.$refs.customerInfoForm.clearForm()
        this.$refs.customerInfoForm.validateForm()
        this.$refs.customerInfoForm.resetForm()
        this.customerDialogFormItems.form.forEach(p=>p.value='')
        this.customerDialogTitleVisible = false
    },
  }
})
