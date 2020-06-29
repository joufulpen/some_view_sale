function postSelection(args, source) {
  console.log(3, 'postSelection')
  source.postMessage({
    method: 'passSelection',
    args: {
      data: vm.productInfoData,
      to: args.to
    }
  }, '*')
}

function alertData(args) {
  console.log(4, 'alertData', args)
}
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlPrice: apiDict[apiName] + 'Price/GetList',
    urlGetList: apiDict[apiName] + 'Order/GetDtlList',
    // urlEditSave: apiDict[apiName] + '/quotation/update',
    // 报价单url
    saveURL: apiDict[apiName] + 'Price/Save',
    auditURL: apiDict[apiName] + 'Price/Submit',
    cellRow: {
      height: '30px',
      padding: "3px 0"
    },
    highlightCurrentRow: true,
    importProductDialogVisible: false,
    editDialogTitle: '新增产品',
    editDialogTitleVisible: false,
    labelWidth: '150px',
    editDialogWidth: '450PX',
    buttons: [],
    productInfoData: [],
    productInfoColumns: [],
    coolFormItems: {},
    orderFormItems: undefined,
    formData: {},
    addTableData: {},
    labelWidth: '100px',
    coolLabelWidth: '80px',
    tableHeight: "300px",
    priceId: null,
    selectedData: [],
    rowClickData: null,
    currentCode: decodeURIComponent(window.location.hash.split('#')[3]),
    isEditData: null,
    priceData: {},
    currentStatus: '',
    // 快速编辑框
    quickDialogVisible: false,
    dialogWidth: '400px',
    labelWidth: '100px',
    currentEditData: {},
    quickCoolFormItems: {}
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    this.productInfoColumns.find(p => p.prop == "amount").formatter = arg => {
      if (arg.price && arg.qty) {
        return arg.amount = Number(arg.price) * Number(arg.qty)
      }
    }
    this.productInfoColumns.find(p => p.prop == "updateDate").formatter = dateFormatter
    this.productInfoColumns.find(p => p.prop == "auditDate").formatter = dateFormatter
    if (window.location.hash.split('#')[4]) this.isEditData = JSON.parse(window.decodeURIComponent(location.hash.split('#')[4]))
    if (this.isEditData) {
      this.orderFormItems.map(item => {
        item.formItems.form.map(p => {
          for (let i in this.isEditData) {
            if (p.name == i) p.value = this.isEditData[i]
          }
        })
      })
    }
    this.getDtlList()
    this.getPriceList()
  },
  watch: {
    rowClickData(arg) {
      this.coolFormItems.additionButtons.buttons[0].disabled = arg == null || this.orderFormItems[0].formItems.form.find(p => p.name == 'audit').value == true
    }
  },
  methods: {
    keyupEnter(arg) {
      console.log(arg)
      this.productInfoData[this.productInfoData.indexOf(this.rowClickData)] = Object.assign(this.productInfoData[this.productInfoData.indexOf(this.rowClickData)], this.addTableData)
      let total = 0
      this.productInfoData.map(item => {
        total += item.price * item.qty
      })
      this.orderFormItems.map(item => {
        item.formItems.form.map(p => {
          if (p.name == "amount") p.value = total
          if (p.name == "justShowPrice") p.value = total
        })
      })
      this.$refs.coolFormView.clearForm()
      this.$refs.coolFormView.validateForm()
      this.$refs.coolFormView.resetForm()
      this.$refs.dataTable.$refs.table.setCurrentRow()
      this.rowClickData = null
    },
    getPriceList() {
      axiosDict[apiName].get(`${this.urlPrice}?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":"${this.currentCode}"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
        .then(res => {
          console.log(res, this.isEditData)
          if (res.length != 0) {
            this.currentStatus = 'edit'
            this.priceData = res[0]

            if (res[0].audit) {
              this.buttons.find(p => p.text == '保存').disabled = res[0].audit
              this.buttons.find(p => p.text == '打印').disabled = !res[0].audit
              this.buttons.find(p => p.text == '审核').text = '退回'
            }
            this.priceId = res[0].id
            this.orderFormItems.map(item => {
              item.formItems.form.map(p => {
                for (let i in res[0]) {
                  if (p.name == i) p.value = res[0][i]
                }
              })
            })
            this.coolFormItems.form.map(item => {
              item.disabled = res[0].audit
              if (item.buttons) {
                item.buttons.map(p => {
                  p.disabled = res[0].audit
                })
              }
            })
          } else {
            this.currentStatus = 'create'
            this.buttons.find(p => p.text == '审核').disabled = true
            this.orderFormItems[2].formItems.form[2].value = ''
          }
        })
    },
    getDtlList() {
      axiosDict[apiName].get(`${this.urlGetList}?formno=${this.currentCode}&condition=[]`)
        .then(res => {
          console.log(res)
          this.productInfoData = []
          if (res) {
            let total = 0
            res.map(item => {
              this.productInfoData.push(item)
              console.log(item.price * item.qty)
              total += item.price * item.qty
            })
            this.orderFormItems.map(item => {
              item.formItems.form.map(p => {
                if (p.name == "amount") p.value = total
                if (p.name == "justShowPrice") p.value = total
              })
            })
          }
        })
    },
    submit(args) {
      switch (args.currentTarget.textContent.trim()) {
        case '确 定':
          {
            this.keyupEnter()
            break
          }
      }
    },
    rowClick(arg) {
      console.log(arg)
      if (arg) {
        let i
        this.rowClickData = arg
        this.coolFormItems.form.map(item => {
          for (i in arg) {
            if (item.name == i) {
              item.value = arg[i]
            }
          }
        })
      }
    },

    rowDblClick(arg) {
      console.log(arg)
      this.quickEditEvent(arg)
    },
    quickEditEvent(arg) {
      this.currentEditData = arg
      this.quickDialogVisible = true
      this.quickCoolFormItems.form.forEach(item => {
        for (let i in arg) {
          if (i == item.name) item.value = arg[i]
        }
      })
      this.$refs.dataTable.clearCurrentRow()
    },
    editDataBtn() {
      this.quickEditEvent(this.selectedData[0])
    },
    quickSaveEvent() {
      let total = 0
      this.productInfoData.map(item => {
        total += item.price * item.qty
      })
      this.orderFormItems.map(item => {
        item.formItems.form.map(p => {
          if (p.name == "amount") p.value = total
          if (p.name == "justShowPrice") p.value = total
        })
      })
    },

    selection(arg) {
      console.log(arg)
      // this.productInfoBtn[2].disabled = arg.length !== 1
      // this.productInfoBtn[3].disabled = arg.length === 0
      this.selectedData = arg
    },
    masterUpdateForm(arg) {

    },
    assistantUpdateForm(arg) {
      for (let i in arg) {
        if (i === 'undefined') delete arg[i]
      }
      console.log(arg)
      this.addTableData = arg
    },

    projectSaveEvent() {
      let allFormData = {}
      this.orderFormItems.map(item => {
        item.formItems.form.map(p => {
          if (p.name == 'justShowPrice') delete p
          allFormData[p.name] = p.value
        })
      })

      let isAllRight = this.$refs.coolForm.every(item => {
        return item.validateForm() == true
      })
      let isPrice = this.productInfoData.every(item => {
        return item.price !== null
      })
      console.log(allFormData, isAllRight, isPrice)
      if (isAllRight) {
        // if (this.productInfoData.length == 0 || this.productInfoData == []) {
        //   Vue.prototype.$notify.info({
        //     title: '产品信息表不能为空！！！',
        //     message: '产品信息表不能为空！！！',
        //     duration: 2000,
        //   })
        // } else {
        if (isPrice) {
          allFormData = Object.assign(allFormData, {
            code: this.currentCode,
            type: 'order'
          })
          axiosDict[apiName].post(this.saveURL, {
            order: allFormData,
            list: this.productInfoData
          }).then(res => {
            console.log(res)
            Vue.prototype.$notify.success({
              title: '成功',
              message: '报价单维护成功',
              duration: 2000,
            })
            setTimeout(() => {
              getDialog(window.parent.vm.dialogs, 'dialog1').visible = !getDialog(window.parent.vm.dialogs, 'dialog1').visible
            }, 800)
          })
        } else {
          Vue.prototype.$notify.info({
            title: '产品信息表明细单价均不能为空',
            message: '产品信息表明细单价均不能为空',
            duration: 2000,
          })
        }

        // }
      }
    },
    audit(auditStatus) {
      axiosDict[apiName].put(this.auditURL, {
        id: this.priceId,
        audit: auditStatus
      }).then(res => {
        console.log(res)
        Vue.prototype.$notify.success({
          title: '成功',
          message: '操作成功',
          duration: 2000,
        })
        this.orderFormItems.map(item => {
          item.formItems.form.map(p => {
            p.disabled = auditStatus
            if (p.name == 'audit') p.value = auditStatus
          })
        })
        this.coolFormItems.form.map(item => {
          item.disabled = auditStatus
          if (item.buttons) {
            item.buttons.map(p => {
              p.disabled = auditStatus
            })
          }
        })
        this.buttons.find(p => p.text == '保存').disabled = auditStatus
        this.buttons.find(p => p.text == '打印').disabled = !auditStatus
        auditStatus ? this.buttons.find(p => p.text == '审核').text = '退回' : this.buttons.find(p => p.text == '退回').text = '审核'
        // } else {
        //   Vue.prototype.$notify.success({
        //     title: res.data.msg,
        //     message: res.data.msg,
        //     duration: 2000,
        //   })
        // }
      })
    },
    buttonEvent(args) {
      switch (args.currentTarget.textContent.trim()) {
        case '保存':
          {
            this.projectSaveEvent()
            break
          }
        case '审核':
          {
            this.audit(true)
            break
          }
        case '退回':
          {
            this.audit(false)
            break
          }
        case '打印':
          {
            let printData = {
              hdr: this.priceData,
              dtls: this.productInfoData
            }
            coolSti.view({
              token: token, //实际使用时请从window取值
              url: apiDict['system'] + 'coolSti',
              // report: 'SimpleList',
              // template: 'Report',
              report: '报价单管理',
              template: '默认',
              data: printData,
              variables: {
                Today: new Date()
              },
              pageTitle: this.currentCode + '报价单',
              isDirectEdit: false,
              onPrintReportName: 'onPrintReport',
              id: this.currentCode,
            })
            break
          }
        case '返回':
          {
            getDialog(window.parent.vm.dialogs, 'dialog1').visible = !getDialog(window.parent.vm.dialogs, 'dialog1').visible
            break
          }
      }
    }
  }
})
