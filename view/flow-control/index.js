var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // url合集
    // urlGetList: apiDict[apiName] + '/quotation/dtlList',
    workflow: {
      url: JSON.parse(JSON.stringify(apiDict[apiName])),
      // location.hash.split('#')[3]
      defId: '',
      instId: ''
    },
    statusList: [],
    currentStatus: '',
    targetNode: '',
    accountList: [],
    submitContent: {
      operator: '',
      packagingOr: '',
      completionDate: ''
    },
    rollbackRemark: '',
    orderId: '',
    availableNodes: []
  },
  computed: {
    currentStatusIndex() {
      return this.statusList.indexOf(this.statusList.find(p => p.value == this.currentStatus))
    },
    nodesBefore() {
      return this.statusList.slice(0, this.currentStatusIndex)
    },
    nodesAfter() {
      return this.statusList.slice(this.currentStatusIndex + 1, this.statusList.length)
    },
    nextNode() {
      return this.statusList.find((p, index) => index == this.currentStatusIndex + 1) == undefined ? {} : this.statusList.find((p, index) => index == this.currentStatusIndex + 1)
    },
    // availableNodes() {
    //   let nodesBefore = []
    //   if (this.nodesBefore.length > 0) {
    //     nodesBefore = JSON.parse(JSON.stringify(this.nodesBefore))
    //     nodesBefore.splice(nodesBefore.length, 0, this.nextNode)
    //     return nodesBefore
    //   }
    // },
    confirmBtnDisabled() {
      if (this.targetNode.length == 0) return true
      if (this.nextNode.value == this.targetNode && (this.targetNode == '图纸处理' || this.targetNode == '拆单处理')) return !this.submitContent.completionDate || this.submitContent.operator.length === 0 || this.targetNode == '拆单处理' && this.submitContent.packagingOr.length === 0
      return false
    },
  },
  watch: {
    nodesBefore(val) {
      let arr = []
      arr = JSON.parse(JSON.stringify(val))
      arr.splice(arr.length, 0, this.nextNode)
      // if (this.currentStatus !== '报价审核') arr.splice(arr.length, 0, this.nextNode)
      this.availableNodes = arr
    },
    nextNode(val) {
      let arr = []
      arr = JSON.parse(JSON.stringify(this.nodesBefore))
      arr.splice(arr.length, 0, val)
      // if (this.currentStatus !== '报价审核') arr.splice(arr.length, 0, val)
      this.availableNodes = arr
    }
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    this.getAllStatus()
    this.getAccountList()
  },
  mounted() {
    this.getOrderData()
  },
  methods: {
    getAllStatus() {
      axiosDict[apiName].get('Order/Status')
        .then(res => {
          this.statusList = res
        })
    },
    getAccountList() {
      axiosDict[apiName].get(`InfoFile/SelectUser`)
        .then(res => {
          this.accountList = res.rows.map(x=>{return {name:x.fullname,operator:x.fullname}})
        })
    },
    getOrderData() {
      this.targetNode = ''
      axiosDict[apiName].get(`Order/GetHdr?formno=${id}`)
        .then(res => {
          console.log('getOrderData', res);
          this.currentStatus = res.status
          this.workflow.defId = res.defId
          this.workflow.instId = res.instId
          this.orderId = res.formno
        }).then(() => {
          this.$refs.workflow.getImg()
        })
    },
    clearContent() {
      for (let i in this.submitContent) {
        this.submitContent[i] = ''
      }
      this.rollbackRemark = ''
    },
    updateStatus() {
      if (this.targetNode == this.nextNode.value) return this.submitData()
      else this.rollback()
    },
    submitData() {
      if (this.targetNode == '图纸处理' || this.targetNode == '拆单处理') {
        axiosDict[apiName].put(`Order/ConfirmHdr`, {
          formno: this.orderId,
          operator: this.submitContent.operator,
          packagingOr: this.submitContent.packagingOr,
          completionDate: this.submitContent.completionDate
        }).then(res => {
          console.log('提交操作,res');
          this.successParentTips(true)
          getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        })
      } else {
        axiosDict[apiName].put(`Order/ConfirmHdr`, {
          formno: this.orderId
        }).then(res => {
          console.log('提交操作,res');
          this.successParentTips(false)
          this.getOrderData()
        })
      }
    },
    rollback() {
      axiosDict[apiName].put('Order/ProcessReturn', {
        formno: this.orderId,
        status: this.currentStatus,
        description: this.rollbackRemark,
        nodeId: this.nodesBefore.find(p => p.value == this.targetNode).nodeId
      }).then(res => {
        console.log('退回操作');
        this.successParentTips(false)
        this.getOrderData()
      })
    },
    terminateBtn() {
      this.$confirm('确定终止？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          axiosDict[apiName].put(`Order/Termination`, {
              formno: this.orderId
            })
            .then(res => {
              console.log('终止完成', res);
              this.successParentTips(true)
              getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
            })
        })
        .catch(() => {})
    },
    successParentTips(parent) {
      if(parent) {
        window.parent.Vue.prototype.$notify.success({
           title: '操作成功',
           message: '操作成功',
           duration: 3000,
         })
      } else {
        Vue.prototype.$notify.success({
           title: '操作成功',
           message: '操作成功',
           duration: 3000,
         })
      }
    }
  }
})
