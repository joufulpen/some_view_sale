function passSelection({
  to,
  data
}) {
  console.log(1, 'passSelection')
  document.getElementById(to).contentWindow.postMessage({
    method: 'alertData',
    args: data
  }, '*')
  console.log(to, data)
  if (data.hasOwnProperty('closeDialog') && to == 'dialog1') vm.dialogs[1].visible = !vm.dialogs[1].visible
}

function getSelection({
  from,
  to
}) {
  console.log(2, 'getSelection')
  document.getElementById(from).contentWindow.postMessage({
    method: 'postSelection',
    args: {
      to
    }
  }, '*')
}

var resourceName = 'Quotation'
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
      isTableRowClick: false,
    },
    //url合集
    urlQuery: apiDict[apiName] + '/quotation/queryByPage',
    urlGetList: apiDict[apiName] + '/quotation/dtlList',
    urlSave: apiDict[apiName] + '/quotation/save',
    urlUpdate: apiDict[apiName] + '/quotation/update',
    urlDelete: apiDict[apiName] + '/quotation/delete',
    urlExamine: apiDict[apiName] + '/quotation/examine',
    urlgetOrderType: apiDict[apiName] + '/info/queryInfo',
    urlGetStatus: apiDict[apiName] + '/quotation/status',
    urlGetHistory: apiDict[apiName] + 'History/GetList',
    urlGetBack: apiDict[apiName] + '/quotation/processReturn',
    urlGetUploadedData: apiDict[apiName] + '/file/list',
    urlDelUploaded: apiDict[apiName] + '/file/delete',
    urlDownload: apiDict[apiName] + '/file/downloadFile',
    urlPrint: apiDict[apiName] + 'Quotation/GetBill',
    takeProductData: undefined,
    //back dialog
    editDialogTitle: '退回操作',
    width: '600px',
    labelWidth: 'auto',
    showQuery: true,
    dialogs: [{
      top: '5vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      // iframeHeight: '500px',
      title: '新建/编辑项目',
      src: '',
      showSaveButton: true,
    }, {
      top: '5vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      width: '90%',
      // iframeHeight: '500px',
      title: '选择产品',
      src: '',
      showSaveButton: true
    }],

    // newEditVisible: false,
    printData: [],
    currentId: [],
    currentAttachInfo: [],
    //查询条件
    condition: {},
    // currentFormItems: [],
    backVisible: false,
    //组件prop
    queryCondition: {},

    //明细表数据
    DtlData: [],

    uploadDialogVisible: false,
    parentId: undefined,
    parentType: '项目',
    currentFile: [],
    size: 'mini',
    //表格单元格样式
    cellRow: {
      height: '30px',
      padding: '3px 0'
    },
    // 其他
    currentRow: undefined,
    dialogVisible: false,
    historyData: [],
    updatedData: [],
    dialogData: [],
    url: undefined,
    currentHdrSelection: [],
    currentDtlTab: "客户沟通信息",
    dtlTableData: []
  },
  watch: {
    currentRow(val) {
      this.$refs.masterView.dtlTableData[2].buttons.find(x => x.text == '新建').disabled = val == undefined
      this.parentId = val == undefined ? undefined : val.formno
    },
    currentFile(val) {
      this.$refs.masterView.dtlTableData[2].buttons.find(x => x.text == '下载').disabled = val.length !== 1
      this.$refs.masterView.dtlTableData[2].buttons.find(x => x.text == '删除').disabled = val.length !== 1
    }
  },
  created() {
    // console.log(window.coolLocals);
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        console.log(p);
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    setInterval(() => {
      this.$refs.masterView.dtlTableData[0].buttons.find(p => p.text == '导出').disabled = this.$refs.masterView.dtlTableData[0].data.length == 0
    })
    //
    // 项目城市数据
    axiosDict['basic'].get(apiDict['basic'] + 'ShipTime/GetList?condition=[]').then(res => {
      console.log(res)
      if (res) this.$refs.masterView.queryCondition.city.options = res.map(x => {
        return {
          lable: x.name,
          value: x.name
        }
      })
    })
    // 项目类型数据
    axiosDict['basic'].get(apiDict['basic'] + 'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E9%A1%B9%E7%9B%AE%E7%B1%BB%E5%9E%8B%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res => {
      console.log(res)
      if (res) this.$refs.masterView.queryCondition.type.options = res.map(x => {
        return {
          lable: x.name,
          value: x.name
        }
      })
    })
    // 项目状态数据
    axiosDict['basic'].get(apiDict['basic'] + 'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E9%A1%B9%E7%9B%AE%E7%8A%B6%E6%80%81%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res => {
      console.log(res)
      if (res) this.$refs.masterView.queryCondition.status.options = res.map(x => {
        return {
          lable: x.name,
          value: x.name
        }
      })
    })
  },
  mounted() {
    //初始化axios的头部信息，使之携带token，每个有请求的页面都必须初始化
    // initial()
    //加载完才可见，谨防出现为渲染的难看的样式
    this.$el.style.visibility = 'visible'
    // 页面进入便查询
    this.$refs.masterView.query()
  },
  methods: {
    dltButtonsEvent(args) {
      let btnText = args.currentTarget.textContent.trim()
      if (this.currentDtlTab == '客户沟通信息' && btnText == '导出') {
        console.log(this.$refs.masterView.dtlTableData[0].data)
        coolSti.view({
          token: token, //实际使用时请从window取值
          url: apiDict['system'] + 'coolSti',
          report: '客户沟通信息',
          template: '默认',
          data: this.$refs.masterView.dtlTableData[0].data,
          variables: {
            Today: new Date()
          },
          pageTitle: this.currentRow.projectName + '客户沟通信息',
          isDirectEdit: false,
          onPrintReportName: 'onPrintReport',
          id: this.currentRow.projectName,
        })
      }
      if(this.currentDtlTab == '附件') {
        switch (btnText) {
          case '新建':
            {
              this.uploadDialogVisible = true
              break
            }
          case '下载':
            {
              downloadFiles(this.currentFile[0].location)
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
    },
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
    delUploaded() {
      this.$confirm('确定删除附件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          let ids = this.currentFile.map(p => p.id)
          let location = this.currentFile.map(p => p.location)
          console.log(ids);
          axiosDict[apiName].delete(`InfoFile`,{
            data: this.currentFile[0]
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
                        // console.log(del);
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
    //获取侧边栏查询参数，同分页信息结合，变成总查询参数
    getCondition(playload) {
      this.condition = Object.assign(this.condition, playload)
    },
    tableSelectionChange(arg) {
      this.currentHdrSelection = arg
    },
    //主表行点击事件处理，编辑删除按钮可用，查询明细表
    tableRowClick(arg) {
      window.HASCHOOSEDATA = arg
      if (arg !== undefined) {
        console.log(arg)
        this.currentRow = arg
        // this.getDtlData(arg)
        this.getHistory()
        this.getUploadedData()
        this.getPrintData()
      }
    },
    //查询历史状态记录
    getHistory() {
      axiosDict[apiName].get(`${this.urlGetHistory}?condition=[{"FieldName": "code","TableName": "[InfoTable]","Value": [{"value": ${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode": "AND","Mode": "等于","DataType": "string"}]`)
        .then(res => {
          this.$refs.masterView.dtlTableData[1].data = res
        })
    },
    // 获取附件列表
    getUploadedData() {
      axiosDict[apiName].get(`InfoFile/GetList?page=1&size=1000000&condition=[{"FieldName": "code","TableName": "[InfoTable]","Value": [{"value": ${JSON.stringify(this.currentRow.formno)}}],"TableRelationMode": "AND","Mode": "等于","DataType": "string"}]`).then(res => {
        console.log('附件列表', res);
        this.$refs.masterView.dtlTableData[2].data = res
      })
    },
    getPrintData() {
      axiosDict[apiName].get(`${this.urlPrint}?formno=${this.currentRow.formno}`)
        .then(res => {
          console.log('打印信息', res);
          this.printData = res
        })
    },

    // 主表按钮操作
    handleNewProejctBtn() {
      this.dialogs[0].title = '新增项目'
      this.dialogs[0].src = `../addAndEditProject/index.html#${token}#id#${this.dialogs[0].name}`
      setTimeout(() => {
        getDialog(this.dialogs, 'dialog1').visible = true
      }, 100)
    },
    handleEditBtn() {
      this.dialogs[0].title = '编辑项目'
      this.dialogs[0].src = `../addAndEditProject/index.html#${token}#id#${this.dialogs[0].name}#${window.encodeURIComponent(JSON.stringify(this.currentHdrSelection[0]))}`
      setTimeout(() => {
        getDialog(this.dialogs, 'dialog1').visible = true
      }, 100)
    },
    handlePrintBtn() {
      if (this.$refs.masterView.hdrTableData.data.length != 0) {
        coolSti.view({
          token: token, //实际使用时请从window取值
          url: apiDict['system'] + 'coolSti',
          report: '项目管理',
          template: '默认',
          data: this.printData,
          variables: {
            Today: new Date()
          },
          pageTitle: '项目' + this.currentHdrSelection[0].formno,
          isDirectEdit: false,
          onPrintReportName: 'onPrintReport',
          id: this.currentHdrSelection[0].formno,
        })
      } else this.$message('无有效数据')
    },
    handleExportBtn() {

    },
    handleNewOrderBtn() {
      this.dialogs[0].title = '新增项目订单'
      console.log(this.currentHdrSelection[0].formno)
      this.dialogs[0].src = `../project-order/index.html#${token}#${this.currentHdrSelection[0].formno}#${this.dialogs[0].name}#${window.encodeURIComponent(JSON.stringify(this.currentHdrSelection[0]))}`
      setTimeout(() => {
        getDialog(this.dialogs, 'dialog1').visible = true
      }, 100)
    },
    //分页变化事件，封装后好像不能直接getDtlData，要先给pagination赋值
    paginationSizeChange(arg) {

    },
    paginationCurrentChange(arg) {

    },
    tabClick(tab, event) {
      console.log('tabClick', tab, event);
      this.currentDtlTab = tab.label
    },
    // 勾选事件
    dltTableSelectionChange(arg) {
      console.log(arg)
      if (this.currentDtlTab == '附件') {
        this.currentFile = arg
      }
    },
  }
})
