//字段映射到列的关系表，格式为：字段名：列序号。如果改变列的位置，只需要修改这里的映射关系
var fieldMap = {
  buildingName: "A",
  floor: "B",
  roomNo: "C",
  windowNo: "D",
  windowTypeNo: "E",
  windowType: "F",
  splitNo: "G",
  reqDeliveryDate: "H",
  qty: "I"
};
//数据开始的行，第一行从1开始
var startRow = 4;

//导入的sheet的名称,也可以是个序号，第一个sheet从1开始
var sheetName = 0;

const RichText = XlsxPopulate.RichText

function readXLSx(file) {
  var fileData = new Blob([file]);
  var dtls = [];
  // A File object is a special kind of blob.
  return XlsxPopulate.fromDataAsync(fileData)
    .then(function(workbook) {
      var sheet = workbook.sheet(sheetName);
      var row = startRow;

      while (true) {
        var item = {};
        for (var col in fieldMap) {
          var field = fieldMap[col] + row;

          var value = sheet.cell(field).value();
          item[col] = value instanceof RichText ? value.text() : value;
        }
        //结束标记，当产品编号的内容是空白的，就跳出读取程序
        if (item["windowNo"] == "" || item["windowNo"] == undefined)
          break;
        dtls.push(item);
        row++;
      }
      return dtls
    });
}

/**
 *
 * @authors Your Name (you@example.org)
 * @date    2019-07-18 09:56:05
 * @version $Id$
 */
 function postSelection(args, source) {
  console.log(3,'postSelection')
      source.postMessage({ method: 'passSelection', args: { data: vm.productInfoData, to: args.to } }, '*')
  }

function alertData(args) {
  // Vue.prototype.$alert(JSON.stringify(args))
  let filterData = []
    filterData = args.data.filter(a => !vm.productInfoData.map(b => b.id).includes(a.id)).map(a => {
                  return a
                })
   console.log(4,'alertData',args,filterData)
    filterData.map(item=>{
      vm.productInfoData.push(item)
    })
  // console.log(vm.productInfoData)
}
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    status: location.hash.split('#')[5],
    cellRow: {
      height: '30px',
      padding: "3px 0"
    },
    productInfoBtn:[],
    productInfoData:[],
    orderFormItems: [],
    orderMessageFormItems:undefined,
    editDialogTitle:'编辑产品',
    labelWidth:'150px',
    editDialogWidth: '450PX',
    editDialogTitleVisible:false,
    editDialogFormItems:undefined,
    productInfoColumns: [],
    formData:{},
    addTableData:{},
    name: location.hash.split('#')[3],
    originalData: {},
    importVisible: false,
    uploadlist: [],
    dialogLoading: false
  },
  created(){
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    let format = ["reqDeliveryDate","reqApprovalDate","actualArrivalDate","actualApprovalDate"]
    format.forEach(p=>{
      this.productInfoColumns.find(f=>f.prop == p).formatter = dateFormatter
    })
    let isprojectInfo
    if (this.status == 'edit' || this.status == 'readonly') {
      if(this.status == 'readonly' || decodeURIComponent(location.hash.split('#')[6]) !== '订单创建'){
        this.orderFormItems.forEach(p=>{
          p.formItems.form.forEach(item=>{
            item.disabled = true
          })
        })
      }
      console.log(location.hash.split('#')[2])
      let projectCode = location.hash.split('#')[2]
      let orderCode = location.hash.split('#')[4]
      axios.all([
        // 获取项目信息
        axiosDict[apiName].get(`Quotation/GetHdr?formno=${projectCode}`)
          .then(res => {
            console.log('获取项目信息',res);
            isprojectInfo = res
            this.orderMessageFormItems.map(item => {
              item.formItems.form.map(p => {
                for (let i in isprojectInfo) {
                  if (p.name == i) p.value = isprojectInfo[i]
                }
              })
            })
          }),
        // 获取项目信息
        axiosDict[apiName].get(`Order/GetHdr?formno=${orderCode}`)
          .then(res => {
            console.log('获取订单信息',res);
            this.originalData = res
            this.orderFormItems.forEach(p => {
              p.formItems.form.forEach(item => {
                item.value = res[item.name]
              })
            })
          }),
        axiosDict[apiName].get(`Order/GetDtlList?formno=${orderCode}&condition=[]`)
          .then(res=>{
            this.productInfoData = res
          })
        ]).finally(()=>{
          console.log('数据全部加载完成');
        })
    } else {
      isprojectInfo = JSON.parse(window.decodeURIComponent(location.hash.split('#')[4]))
      console.log(isprojectInfo)
      this.orderMessageFormItems.map(item => {
        item.formItems.form.map(p => {
          for (let i in isprojectInfo) {
            if (p.name == i) p.value = isprojectInfo[i]
          }
        })
      })
    }
  },
  watch:{

  },
  mounted(){
    // window.addEventListener('message', this.receiveMessage, false)
    // 业务跟进人数据
    axiosDict['basic'].get('Employee/GetList?condition=[]').then(res=>{
      console.log('业务跟进人',res)
      if(res)this.orderFormItems[0].formItems.form.find(p=> p.label == '业务跟进人').options = res.map(x=>{return {value:x.id,label:x.name}})
    })
    // 异常情况标记数据
    axiosDict['basic'].get(apiDict['basic'] + 'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E8%AE%A2%E5%8D%95%E5%BC%82%E5%B8%B8%E6%83%85%E5%86%B5%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      if(res){
        this.orderFormItems[2].formItems.form.find(p=> p.label == '异常情况标记').options = res.map(x=>{return {value:x.name,label:x.name}})
      }
    })
    //订单类型数据
    axiosDict['basic'].get('BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E8%AE%A2%E5%8D%95%E7%B1%BB%E5%9E%8B%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      if(res)this.orderFormItems[0].formItems.form.find(p=> p.label == '订单类型').options = res.map(x=>{return {value:x.name,label:x.name}})
    })
    // 船期选择数据
    axiosDict['basic'].get('BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E8%88%B9%E6%9C%9F%E9%80%89%E6%8B%A9%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      if(res)this.orderFormItems[1].formItems.form.find(p=> p.label == '船期选择').options = res.map(x=>{return {value:x.name,label:x.name}})
    })
    // 产品类型数据
    axiosDict['basic'].get('TypeofProduct/GetList?condition=[]').then(res=>{
      if(res)this.editDialogFormItems.form.find(p=> p.label == '窗类型').options = res.map(x=>{return {value:x.name,label:x.name}})
    })
  },
  methods:{
    masterUpdateForm(arg){
      this.formData = Object.assign(this.formData,arg)
      console.log(this.formData,arg)
    },
    assistantUpdateForm(arg){
      this.formData = Object.assign(this.formData,arg)
      console.log(this.formData)
    },
    projectSaveEvent(){
        let allFormData = {}
        this.orderFormItems.map(item => {
            item.formItems.form.map(p=>{
              allFormData[p.name] = p.value
            })
        })
        this.orderMessageFormItems.map(item => {
            item.formItems.form.map(p=>{
              if(p.label !== '项目类型' && p.label !== '项目备注') allFormData[p.name] = p.value
            })
        })
        console.log(allFormData)
        let isAllRight = this.$refs.coolForm.every(item=>{
           return item.validateForm() == true
        })
        // let isOtherRight = this.$refs.otherCoolForm.every(item=>{
        //    return item.validateForm() == true
        // })
        console.log(isAllRight)
      if(isAllRight){
        // if(this.productInfoData.length == 0 || this.productInfoData == []) {
        //     Vue.prototype.$notify.warning({
        //       title: '产品信息表不能为空！！！',
        //       message: '产品信息表不能为空！！！',
        //       duration: 2000,
        //     })
        // }else {
          allFormData = Object.assign(allFormData, {
            isProjectOrder: true,
            projectCode: location.hash.split('#')[2]
          })
          allFormData = window.location.hash.split('#')[5] == 'edit' ? Object.assign(this.originalData,allFormData) : allFormData

          if(window.location.hash.split('#')[5] !== 'edit') {
            let isprojectInfo = JSON.parse(window.decodeURIComponent(location.hash.split('#')[4]))
            allFormData.customerCode = isprojectInfo.customerCode
            allFormData.customerContactCode = isprojectInfo.customerContactCode
            allFormData.pformno = isprojectInfo.formno
          }
          // console.log('allFormData',allFormData);
          // console.log('productInfoData',this.productInfoData);

          axiosDict[apiName].post(`Order/SaveBill`, {
            hdr: allFormData,
            dtls: this.productInfoData
          }).then(res => {
            console.log(res)
              Vue.prototype.$notify.success({
                title: '操作成功',
                duration: 2000,
              })
              setTimeout(() => {
                getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
              }, 800)
          })

        // }
      }

    },
    selection(arg){
      console.log(arg)
      this.productInfoBtn[2].disabled = arg.length !== 1
      this.productInfoBtn[3].disabled = arg.length === 0
      if(arg.length !== 0){
        this.selectionData = arg
      }
    },

    backEvent() {
      this.$refs.formItems.resetForm()
      this.$nextTick(()=>{
        this.$refs.formItems.clearForm()
        this.editDialogTitleVisible = false
      })
    },
   saveEvent(){
    // if(this.$refs.formItems.validateForm()){
    if(this.editDialogTitle == '新增产品') {
      this.productInfoData.unshift(this.addTableData)
    } else {
      this.productInfoData[this.productInfoData.indexOf(this.selectionData[0])] = Object.assign( this.productInfoData[this.productInfoData.indexOf(this.selectionData[0])],this.addTableData)
    }
      this.$refs.formItems.clearForm()
      this.$refs.formItems.validateForm()
      this.$refs.formItems.resetForm()
      this.editDialogTitleVisible = false
    // }
    },
    updateForm(arg){
      console.log(arg)
      this.addTableData = arg
    },
    buttonEvent(args){
      switch (args.currentTarget.textContent.trim()) {
        case '导入产品':
        {
          this.importVisible = true
          break
        }
        case '选择产品':
        {
              window.parent.vm.dialogs[1].title = `选择产品`
              window.parent.vm.dialogs[1].src = `../choose-product/index.html#${token}#${location.hash.split('#')[2]}#${window.parent.vm.dialogs[1].name}`
              setTimeout(() => {
                getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
              }, 100)
              break
        }
        case '添加产品':
        {
          this.editDialogTitle = '新增产品'
          this.editDialogTitleVisible = true
          break
        }
        case '编辑产品':
        {
           this.editDialogTitle = '编辑产品'
          this.editDialogFormItems.form.map(item=>{
            for(let i in this.selectionData[0]){
              if(i == item.name)item.value = this.selectionData[0][i]
            }
          })
          this.editDialogTitleVisible = true
          break
        }
         case '删除产品' :
        {
          this.selectionData.forEach(p => {
            this.productInfoData.splice(this.productInfoData.indexOf(p), 1)
          })
          break
        }
      }
    },
    dialogClose() {
      this.$refs.formItems.resetForm()
      this.$nextTick(()=>{
        this.$refs.formItems.clearForm()
        this.editDialogTitleVisible = false
      })
    },
    // 模板下载
    templateDownload() {
      saveAs(`./static/产品导入模板.xlsx`,'产品导入模板')
    },
    // 导入操作
    btnImport_click() {
      this.dialogLoading = true
      console.log(this.uploadlist);
      var file = this.uploadlist[0].raw
      readXLSx(file).then(rows => {
        //这里是结果，另外程序处理
        console.debug(rows);
        vm.handleImport(rows)
      })
    },
    importDialogClose() {
      this.uploadlist = []
      this.importVisible = false
    },
    handleChange(file, fileList) {
      if (fileList.length > 1) fileList.splice(0, 1)
      this.uploadlist = fileList
    },
    handleRemove(file, fileList) {
      this.uploadlist = fileList
    },
    handleImport(importData) {
      setTimeout(()=>{
        this.dialogLoading = false
        this.productInfoData = importData
        this.importVisible = false
      },500)

      // this.productInfoData.filter(a=> importData.map())
      // let filterData = importData.filter(a => !vm.productInfoData..includes(a))
    },
  }
})
