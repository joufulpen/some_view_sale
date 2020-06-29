// function postSelection(args, source) {
//  console.log(3,'postSelection')
//      source.postMessage({ method: 'passSelection', args: { data: vm.productInfoData, to: args.to } }, '*')
//  }

 // function alertData(args) {
 //   // Vue.prototype.$alert(JSON.stringify(args))
 //   console.log('alertData',args);
 //   console.log('currentDelivery',vm.currentDelivery);
 //   console.log('deliveryFullData',vm.deliveryFullData);
 //   let filterData = []
 //   // console.log(vm.deliveryFullData.find(p=>p.order.diyId == vm.currentDelivery[0].diyId));
 //   filterData = args.filter(a => !vm.deliveryFullData.find(p=>p.order.diyId == vm.currentDelivery[0].diyId).list.map(b => b.containerCode).includes(a.id)).map(a => {
 //     return a
 //   })
 //   console.log('过滤出filterData',filterData);
 //   //  console.log(4,'alertData',args,filterData)
 //   // filterData.map(p=>({
 //   //   orderCode: p.parentID,
 //   //   containerCode: p.id,
 //   //   packingCode: p.packs,
 //   //   width: p.width,
 //   //   height: p.height,
 //   //   length: p.length,
 //   //   weight: p.weight,
 //   //   recStatus: p.recStatus
 //   // }))
 //  let reshapeFilterData = filterData.map(p=> ({
 //       orderCode: p.parentID,
 //       containerCode: p.id,
 //       packingCode: p.packs,
 //       width: p.width,
 //       height: p.height,
 //       length: p.length,
 //       weight: p.weight,
 //       recStatus: p.recStatus
 //   }))
 //   console.log('重新构建filterData',reshapeFilterData);
 //   reshapeFilterData.forEach(item=>{
 //     vm.deliveryFullData.find(p=>p.order.diyId == vm.currentDelivery[0].diyId).list.push(item)
 //     vm.deliveryFullData.forEach(p=>{
 //       p.order.qty = p.list.length
 //     })
 //   })
 //   console.log('添加包装后的deliveryFullData',vm.deliveryFullData)
 // }
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    status: '',
    formItems: {},
    dataBeforeEdit: {},
    deliveryTableBtn: [],
    deliveryFullData: [],
    deliveryTableColumns: [],
    cellRow: {
      height: '30px',
      padding: "3px 0"
    },
    orderList: [],
    containerDialogTitle: '',
    containerForm: [],
    containerDialogVisible: false,
    // 货柜明细表
    // 请求包装箱parentID、id
    containerData: [],
    containerColumns: [],
    currentContainer: {},
    currentDelivery: [],
    selectedContainer: [],

    // 木箱清单
    woodenCaseDialogVisible:false,
    woodenCaseDialogTitle: '木箱清单',
    woodenCaseData: [],
    woodenCaseColumns: [],
    currentWoodenCaseSelection: [],
    currentDeliveryCache: [],
    // 用作存放当前本地已录入过的木箱
    woodenCaseCache: []
  },
  watch: {
    deliveryFullData(val) {
      window.parent.vm.dialogs[0].saveBtnDisabled = val.length<=0
    }
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    let woodenCaseFormat = ["length","width","height","weigth"]
    woodenCaseFormat.forEach(p=>{
      this.woodenCaseColumns.find(f=>f.prop == p).formatter = numberToFixedFormatter
    })
    this.status = window.location.hash.split('#')[2]
    if (this.status == 'edit' || this.status == 'readonly') {
      if (this.status == 'readonly') {
        // this.deliveryTableBtn.forEach(p => p.disabled = true)
        this.formItems.form.forEach(p => p.disabled = true)
      }
      this.formItems.form.find(p => p.label == '发货单编号').disabled = true
      // this.formItems.form.find(p => p.label == '订单选择').disabled = true
      let formno = window.location.hash.split('#')[3]
      // axiosDict[apiName].post(`/delivery/queryByPage`, {
      //     condition: {
      //       "current": 1,
      //       "offset": 10,
      //       "formno": formno,
      //       "pformno": "",
      //       "type": "",
      //       "customerName": "",
      //       "logisticsCompany": "",
      //       "exitPort": "",
      //       "arrivalPort": "",
      //       "deliveryTime": ["", ""],
      //       "createDate": ["", ""]
      //     }
      //   })
      //   .then(res => {
      //     // 获取发货单信息
      //     this.dataBeforeEdit = res.rows[0]
      //     this.formItems.form.forEach(p => {
      //       p.value = res.rows[0][p.name]
      //     })
      //   })
        axiosDict[apiName].get(`Delivery/GetHdrPageList?page=1&size=10&condition=[{"FieldName":"formno","TableName":"[Hdr]","Value":[{"value":${JSON.stringify(formno)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
          .then(res => {
            // 获取发货单信息
            this.dataBeforeEdit = res.rows[0]
            this.formItems.form.forEach(p => {
              p.value = res.rows[0][p.name]
            })
          })

      //   axiosDict[apiName].post(`/delivery/containerList`, {
      //     formno: formno
      //   })
      //   .then(res => {
      //     // 获取货柜信息
      //     res.rows.forEach(p => {
      //       p.diyId = this.genDiyId(10)
      //       this.deliveryFullData.push({
      //         order: p,
      //         list: []
      //       })
      //     })
      //   })
      //   .then(() => {
      //     // 循环获取货柜明细
      //     axios.all([
      //       this.deliveryFullData.map(p => {
      //         return axiosDict[apiName].post(`/delivery/dtlList`, {
      //           formno: p.order.formno,
      //           huoGuiCode:p.order.containerCode
      //         })
      //         .then(detail => {
      //           console.log('循环货柜明细结果',detail);
      //           p.list = detail
      //         })
      //       })
      //     ])
      // })

      axiosDict[apiName].get(`DeliveryContainer/GetList?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":${JSON.stringify(formno)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
        .then(res => {
          // 获取货柜信息
          console.log('获取货柜信息',res);
          res.forEach(p => {
            p.diyId = this.genDiyId(10)
            this.deliveryFullData.push({
              order: p,
              list: []
            })
          })
        })
        .then(() => {
          // 循环获取货柜明细
          axios.all([
            this.deliveryFullData.map(p => {
              // return axiosDict[apiName].post(`/delivery/dtlList`, {
              //   formno: p.order.formno,
              //   huoGuiCode:p.order.containerCode
              // })
              // .then(detail => {
              //   console.log('循环货柜明细结果',detail);
              //   p.list = detail
              // })
              return axiosDict[apiName].get(`Delivery/GetDtlList?condition=[{"FieldName":"containerCode","TableName":"[Dtl]","Value":[{"value":${JSON.stringify(p.order.containerCode)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]&formno=${formno}`)
              .then(detail => {
                console.log('循环货柜明细结果',detail);
                p.list = detail
              })
            })
          ])
        })
    }
  },
  mounted() {
    window.parent.vm.dialogs[0].saveBtnDisabled = true
    setInterval(() => {
      this.formItems.form.find(p => p.label == '订单选择').disabled = this.deliveryFullData.some(p=>p.list.length !== 0) || this.status !== 'new'
      this.deliveryTableBtn.find(p => p.text == '新增').disabled = this.formItems.form.find(p=>p.label == '订单选择').value.length <= 0 || this.status == 'readonly'
      this.deliveryTableBtn.find(p => p.text == '添加订单木箱').disabled = this.currentDelivery.length !== 1 || this.status == 'readonly'
      this.deliveryTableBtn.find(p => p.text == '编辑').disabled = this.currentDelivery.length !== 1 || this.status == 'readonly'
      this.deliveryTableBtn.find(p => p.text == '删除').disabled = this.currentDelivery.length == 0 || this.status == 'readonly'
    })

    let basicModuleRequestDict = ['发货类型', '物流公司', '物流方式', '航线', '货柜类型']
    axios.all(
      basicModuleRequestDict.map(dict => {
        return axiosDict['basic'].get(`BaseProperty/GetList?condition=[{"FieldName":"Type","TableName":"[BaseProperty]","Value":[{"value":"${dict}"}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
          .then(res => {
            return dict === '货柜类型' ? (this.containerForm.form.find(p => p.label == dict).options = res.map(p => ({
              value: p.name
            }))) : (this.formItems.form.find(p => p.label == dict).options = res.map(p => ({
              value: p.name
            })))
          })
      }))

    axios.all([
      axiosDict[apiName].get('Order/GetHdrPageList?page=1&size=10000000&condition=[]')
      .then(res => {
        // 筛选项目订单
        console.log('获取项目订单',res);
        this.orderList = res.rows.filter(p=>p.isProjectOrder == true && p.status !== '订单创建'  && p.status !== '订单终止')
      }),
      axiosDict['basic'].get(`Port/GetList?condition=[]`)
      .then(res => {
        let dict = ['出关口岸', '到港口岸']
          dict.forEach(item => {
            this.formItems.form.find(p => p.label == item).options = res.filter(p => p.type == item).map(m => ({
              value: m.name
            }))
          })
      }),
      axiosDict['basic'].get('Employee/GetList?condition=[]').then(res=>{
        console.log('跟进人',res)
        this.formItems.form.find(p=> p.label == '跟进人').options = res.map(x=>{return {value:x.id,label:x.name}})
      }),
      axiosDict['basic'].get(`Company/GetList?condition=[]`)
        .then(res=>{
          this.formItems.form.find(p => p.label == '发货单位').options = res.map(m => ({
            label: m.name,
            value: m.id,
            phone: m.phone
          }))
          let dict = [{label:'发货单位',prop:'value'}, {label:'发货人电话',prop:'phone'}]
            dict.forEach(item => {
              this.formItems.form.find(p => p.label == item.label).value = this.formItems.form.find(p => p.label == '发货单位').options[0][item.prop]
            })
        }),
    ]).then(res => {
      console.log('successfully get all options!');
    })
  },
  methods: {
    remoteMethod(query, label) {
      if (label == '订单选择') {
        let orderList = this.orderList.map(p => ({
          label: p.formno,
          value: p.formno
        }))
        if (query !== '') {
          this.formItems.form.find(p => p.label == '订单选择').loading = true;
          setTimeout(() => {
            this.formItems.form.find(p => p.label == '订单选择').loading = false;
            this.formItems.form.find(p => p.label == '订单选择').options = orderList.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.formItems.form.find(p => p.label == '订单选择').options = [];
        }
      }
    },
    // 表单更新
    updateForm(arg) {
      if (arg.pformno.length !== 0) {
        let dict = [{
          label: '客户',
          prop: 'customerName'
        },{
          label: '联系人',
          prop: 'customerContactName'
        },{
          label: '联系电话',
          prop: 'customerPhone'
        },{
          label: '送货地址',
          prop: 'customerAddress'
        }]
        dict.forEach(d=>{
          this.formItems.form.find(p => p.label == d.label).value = this.orderList.find(p => p.formno == arg.pformno)[d.prop]
        })
      }
      if(arg.deliveryUnitName.length !== 0){
        this.formItems.form.find(p => p.label == '发货人电话').value = this.formItems.form.find(p => p.label == '发货单位').options.find(m=>m.value == arg.deliveryUnitName).phone
      }
      console.log(arg);
    },
    updateFullPage() {
      if(!this.$refs.formItems.validateForm()) return
      let deliveryData = {}
      this.formItems.form.forEach(p => {
        deliveryData[p.name] = p.value
      })

      if (this.status == 'new') {
        axiosDict[apiName].post(`Delivery/Save`, {
            delivery: deliveryData,
            container: this.deliveryFullData
          })
          .then(res => {
            console.log(res);
            window.parent.Vue.prototype.$notify.success({
               title: '保存成功',
               message: '保存成功',
               duration: 3000,
             })
            getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
            window.parent.vm.$refs.masterView.query()
          })
      }
      else if (this.status == 'edit') {
        deliveryData = Object.assign(this.dataBeforeEdit, deliveryData)
        axiosDict[apiName].put(`Delivery/Update`, {
            delivery: deliveryData,
            container: this.deliveryFullData
          })
          .then(res => {
            console.log(res);
            window.parent.Vue.prototype.$notify.success({
               title: '保存成功',
               message: '保存成功',
               duration: 3000,
             })
            getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
            window.parent.vm.getAllData()
          })
      }
    },
    // cancelBtn() {
    //   getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    // },
    buttonsevent(args) {
      switch (args.currentTarget.textContent.trim()) {
        case '新增':
          {
            this.containerDialogTitle = '新增货柜'
            this.containerDialogVisible = true
            break
          }
        case '编辑':
          {
            this.containerDialogTitle = '编辑货柜信息'
            for (item in this.currentDelivery[0]) {
              this.containerForm.form.forEach(p => {
                if (p.name == item) {
                  p.value = this.currentDelivery[0][item]
                }
              })
            }
            this.containerData = this.deliveryFullData.find(p=>p.order.diyId == this.currentDelivery[0].diyId).list
            this.containerDialogVisible = true
            break
          }
        case '删除':
          {
            this.currentDelivery.forEach(p => {
              this.deliveryFullData.find((o, index) => {
                if (p.diyId == o.order.diyId){
                  o.list.forEach(i=>{
                    this.woodenCaseCache.find((a,index)=>{
                      if(i.containerCode == a) return this.woodenCaseCache.splice(index,1)
                    })
                  })
                  return  this.deliveryFullData.splice(index, 1)
                }
              })
            })
            break
          }
        case '添加订单木箱':
          {
            // axiosDict[apiName].post('/order/boxList',{pformno:this.formItems.form.find(p => p.label == '订单选择').value}).then(res=>{
            //   console.log('木箱清单',res)
            //   // 显示未录入过发货单的木箱
            //   this.woodenCaseData = res.filter(p=>(p.delivery==false && !this.woodenCaseCache.includes(p.containerCode)))
            //   this.woodenCaseDialogVisible = true
            // })

            axiosDict[apiName].get(`OrderContainer/GetList?condition=[{"FieldName":"code","TableName":"[InfoTable]","Value":[{"value":${JSON.stringify(this.formItems.form.find(p => p.label == '订单选择').value)}}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}]`)
              .then(res => {
                console.log('木箱清单', res)
                // 显示未录入过发货单的木箱
                this.woodenCaseData = res.filter(p=>(p.delivery==false && !this.woodenCaseCache.includes(p.containerCode)))
                this.woodenCaseDialogVisible = true
              })
            // window.parent.vm.dialogs[1].title = `添加订单木箱`
            // window.parent.vm.dialogs[1].src = `${serveObject.encasementURL}woodcase2/index.html#${token}#2039 Grove工程`
            // // window.parent.vm.dialogs[1].src = `../choose-product/index.html#${token}#${location.hash.split('#')[2]}#${window.parent.vm.dialogs[1].name}`
            // setTimeout(() => {
            //   getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
            // }, 100)
            break
          }
        default:
          break
      }
    },
    deliveryTableSelection(arg) {
      console.log('deliveryTableSelection',arg);
      this.currentDelivery = arg
      if(arg.length!==0) this.currentDeliveryCache = arg
    },
    containerSelection(arg) {
      console.log('containerSelection',arg);
      this.selectedContainer = arg
    },
    updateContainerForm(arg) {
      console.log('updateContainerForm',arg);
      this.currentContainer = arg
    },
    removeContainerData(){
      this.selectedContainer.forEach(p=>{
        this.containerData.find((item,index)=>{
          if(p == item) return this.containerData.splice(index,1)
        })
        this.woodenCaseCache.find((a,index)=>{
          if(p.containerCode == a) return this.woodenCaseCache.splice(index,1)
        })
      })
    },
    containerSaveClick() {
      if(!this.$refs.containerForm.validateForm()) return
      if (this.containerDialogTitle == '新增货柜') {
        let currentContainer = JSON.parse(JSON.stringify(this.currentContainer))
        currentContainer.diyId = this.genDiyId(10)
        this.deliveryFullData.unshift({
          order: currentContainer,
          list: []
        })
        console.log(this.deliveryFullData);
      }
      if (this.containerDialogTitle == '编辑货柜信息') {
        let obj = this.deliveryFullData.find(p => p.order.diyId == this.currentDeliveryCache[0].diyId).order
        obj = Object.assign(obj, this.currentContainer)

        this.deliveryFullData.find(p=>p.order.diyId == this.currentDeliveryCache[0].diyId).list = JSON.parse(JSON.stringify(this.containerData))
      }
      this.deliveryFullData.forEach(p=>{
        p.order.qty = p.list.length
      })
      this.containerDialogVisible = false
    },
    containerDialogClose() {
      this.currentDelivery = []
      this.currentContainer = {}
      this.containerData = []
      // this.$refs.containerForm.resetForm()
      this.containerForm.form.forEach(p => {
          p.value = ''
      })
      this.$refs.deliveryTable.clearSelectionOuter()
    },
    genDiyId(length) {
      return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
    },
    // 添加订单木箱
    woodenCaseDialogClose(){
      this.currentWoodenCaseSelection = []
    },
    woodenCaseSelection(arg){
      console.log('木箱选择',arg);
      this.currentWoodenCaseSelection = arg
    },
    woodenCaseSaveClick(){
      let filterData = []
      filterData = this.currentWoodenCaseSelection.filter(a => !this.deliveryFullData.find(p=>p.order.diyId == this.currentDeliveryCache[0].diyId).list.map(b => b.containerCode).includes(a.containerCode)).map(a => {
        return a
      })
      console.log('过滤出filterData',filterData);
     let reshapeFilterData = filterData.map(p=> ({
          pformno: p.pformno,
          qty: p.qty,
          containerCode: p.containerCode,
          width: p.width,
          height: p.height,
          length: p.length,
          weight: p.weight,
          status: p.status,
          storeId: p.storeId
      }))
      console.log('重新构建filterData',reshapeFilterData);

      let arr = reshapeFilterData.filter(p=> !this.woodenCaseCache.includes(p.containerCode)).map(p=>(p.containerCode))
      arr.forEach(p=>{
        this.woodenCaseCache.push(p)
      })

      reshapeFilterData.forEach(item=>{
        this.deliveryFullData.find(p=>p.order.diyId == this.currentDeliveryCache[0].diyId).list.push(item)
        this.deliveryFullData.forEach(p=>{
          p.order.qty = p.list.length
        })
      })
      console.log('添加包装后的deliveryFullData',this.deliveryFullData)
      this.woodenCaseDialogVisible = false
    },
  }
})



// 订单选择
// querySearch(queryString, cb) {
//   let arr = JSON.parse(JSON.stringify(this.orderList)).map(p => ({
//     value: p.orderCode,
//     name: p.orderName
//   }))
//   var results = queryString ?
//     arr.filter(this.createFilter(queryString)) :
//     []
//   cb(results)
// },
// createFilter(queryString) {
//   return p => {
//     return (
//       p.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
//     )
//   }
// },
