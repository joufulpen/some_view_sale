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
   console.log(4,'alertData',args)
}
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetList: 'Quotation/GetDtlList',
    urlCreateOrEdit: 'Quotation/SaveBill',
    cellRow: {
      height: '30px',
      padding: "3px 0"
    },
    // importProductDialogVisible:false,
    editDialogTitle:'新增',
    editDialogTitleVisible:false,
    formLabelWidth:'150px',
    labelWidth:'150px',
    editDialogWidth: '450PX',
    productInfoBtn:[],
    productInfoData:[],
    productInfoColumns: [],
    orderFormItems:undefined,
    orderMessageFormItems:undefined,
    editDialogFormItems:undefined,
    addTableData:{},
    selectionData:undefined,
    customerData:[],

    isEditData:null
  },
  created(){
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    this.productInfoColumns.find(p=>p.prop == "updDate").formatter = dateFormatter
    this.productInfoColumns.find(p=>p.prop == "endDate").formatter = dateFormatter
    this.editDialogFormItems.form.find(p=>p.name == 'updDate').pickerOptions = {
      disabledDate(time) {
        return time.getTime() > Date.now()
      }
    }

   if(location.hash.split('#')[4]) this.isEditData =JSON.parse(window.decodeURIComponent(location.hash.split('#')[4]))
   console.log(this.isEditData)
   if(this.isEditData){
    this.orderFormItems.map(item=>{
      item.formItems.form.map(p=>{
        if(p.rules)p.disabled = true
        for(let i in this.isEditData) {
          if(p.name == i) p.value = this.isEditData[i]
        }
      })
    })
    this.orderMessageFormItems.map(item=>{
      item.formItems.form.map(p=>{
        for(let i in this.isEditData) {
          if(p.name == i) p.value = this.isEditData[i]
        }
      })
    })
    axiosDict[apiName].get(`${this.urlGetList}?formno=${this.isEditData.formno}&condition=[]`)
      .then(res=>{
        this.productInfoData = res
      })
   }
  },
  mounted(){
    // 产品类型数据
    // axiosDict['basic'].get(apiDict['basic'] +'TypeofProduct/GetList?condition=[]').then(res=>{
    //   console.log(res)
    //   if(res)this.editDialogFormItems.form.find(p=>p.label == '产品类型').options = res.map(x=>{return {label:x.name,value:x.name}})
    // })
    // 项目类型数据
    axiosDict['basic'].get(apiDict['basic'] +'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E9%A1%B9%E7%9B%AE%E7%B1%BB%E5%9E%8B%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      console.log(res)
      if(res)this.orderFormItems[0].formItems.form.find(p=>p.label == '项目类型').options = res.map(x=>{return {label:x.name,value:x.name}})
    })
    // 项目城市数据
    axiosDict['basic'].get(apiDict['basic'] +'ShipTime/GetList?condition=[]').then(res=>{
      console.log(res)
      if(res)this.orderFormItems[0].formItems.form.find(p=>p.label == '项目城市').options = res.map(x=>{return {label:x.name,value:x.name}})
    })
    // 建筑商数据
    axiosDict['basic'].get(apiDict['basic'] +'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E5%BB%BA%E7%AD%91%E5%95%86%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      console.log(res)
      if(res)this.orderFormItems[2].formItems.form.find(p=>p.label == '建筑商').options = res.map(x=>{return {label:x.name,value:x.id}})
    })
    // 安装公司数据
    axiosDict['basic'].get(apiDict['basic'] +'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E5%AE%89%E8%A3%85%E5%85%AC%E5%8F%B8%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      console.log(res)
      if(res)this.orderFormItems[2].formItems.form.find(p=>p.label == '安装公司').options = res.map(x=>{return {label:x.name,value:x.id}})
    })
    // 设计公司数据
     axiosDict['basic'].get(apiDict['basic'] +'BaseProperty/GetList?condition=[%7B%22FieldName%22:%22Type%22,%22TableName%22:%22[BaseProperty]%22,%22Value%22:[%7B%22value%22:%22%E8%AE%BE%E8%AE%A1%E5%85%AC%E5%8F%B8%22%7D],%22TableRelationMode%22:%22AND%22,%22Mode%22:%22%E7%AD%89%E4%BA%8E%22,%22DataType%22:%22string%22%7D]').then(res=>{
      console.log(res)
      if(res)this.orderFormItems[2].formItems.form.find(p=>p.label == '设计公司').options = res.map(x=>{return {label:x.name,value:x.id}})
    })
     // 客户名称输入建议数据
     axiosDict['basic'].get(apiDict['basic'] +'Customer/GetPageList?page=1&size=10000000&condition=[]').then(res=>{
      console.log(res)
      if(res){
        let options = res.rows.map(x=>{return {label:x.name,value:x.id,customerAddress:x.address,customerRemark:x.description,contacts:x.contacts,} })
        this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').options =  options
        this.customerData = options
        if (this.isEditData) {
          this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').options = options.find(p => p.value == this.isEditData.customerCode).contacts.map(p=>({label:p.name,value:p.id}))
        }
      }
    })
  },
  watch:{
    // isHasValue(arg){
    //   if(arg == ''){
    //    this.orderFormItems[1].formItems.form.forEach(item=>{ item.value = ''})
    //     this.orderFormItems[1].formItems.form.find(p=>p.label == '客户联系人').options = []
    //   }
    //   else{
    //      console.log(arg,this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').data,this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').data.some(p=>p.value ==arg))
    //     if(!this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').data.some(p=>p.value ==arg) && this.isEditData == null){
    //       this.$confirm('客户名字选择后 请勿修改')
    //       .then(_ => {
    //         this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').value = ''
    //       })
    //       .catch(_ => {this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').value = ''});
    //     }
    //   }
    // },
    selectionData(arg){
      this.productInfoBtn.find(p=>p.text=='删除').disabled = arg.length === 0
      this.productInfoBtn.find(p=>p.text=='编辑').disabled = arg.length !== 1
    }
  },
  computed:{
    isHasValue:function(){
      if(this.orderFormItems)
       return this.orderFormItems[1].formItems.form.find(p=>p.label == '客户名称').value
    }
  },
  methods:{
    // importProductEvent(){
    //   this.$message('开发中 别急')
    // },
    closedialog(){

    },
    closeClicked(){

    },
    // select(arg){
    //   console.log(arg)
    //   let param ={
    //       condition:JSON.stringify([{"FieldName":"parentID","TableName":"[Contact]","Value":[{"value":arg.id}],"TableRelationMode":"AND","Mode":"等于","DataType":"string"}])
    //     };
    //     axiosDict['basic'].get(apiDict['basic'] + 'Contact/GetList',{
    //     params:param
    //     }).then(res => {
    //       console.log(res)
    //        if(res.length != 0){
    //         this.orderFormItems[1].formItems.form.find(p=>p.label == '客户联系人').options = res.map(x=>{return {label:x.name,value:x.name}})
    //         this.orderFormItems[1].formItems.form.find(p=>p.label == '客户联系人').value = res[0].name
    //       }else{
    //         this.orderFormItems[1].formItems.form.find(p=>p.label == '客户联系人').options = []
    //         this.orderFormItems[1].formItems.form.find(p=>p.label == '客户联系人').value = ''
    //       }
    //     })
    //     this.orderFormItems[1].formItems.form.map(item=>{
    //         for(let i in arg){
    //           if(item.name == i)item.value = arg[i]
    //         }
    //     })
    // },
    //  // 下拉选择框筛选方法
    //   querySearch(queryString, cb, labelData) {
    //     console.log('queryString, cb, labelData',queryString, cb, labelData);
    //         let index =  this.orderFormItems[1].formItems.form.findIndex(p=>{
    //               return p.label == labelData
    //           })
    //           var results = queryString ? this.orderFormItems[1].formItems.form[index].data.filter(this.createFilter(queryString)) : this.orderFormItems[1].formItems.form[index].data
    //           cb(results)
    //     },
    //     createFilter(queryString) {
    //       return name => {
    //         return (
    //           name.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
    //         )
    //       }
    //     },
    selection(arg){
      console.log(arg)
      this.selectionData = arg
      // if(arg.length !== 0){
      //   this.selectionData = arg
      // }
    },
    remoteMethod(query,label) {
      if(label == '客户名称') {
        if(query.length !== 0) {
          this.orderFormItems[1].formItems.form.find(p => p.label == '客户名称').loading = true;
          setTimeout(() => {
            this.orderFormItems[1].formItems.form.find(p => p.label == '客户名称').loading = false;
            this.orderFormItems[1].formItems.form.find(p => p.label == '客户名称').options = this.customerData.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.orderFormItems[1].formItems.form.find(p => p.label == '客户名称').options = []
        }
      }
    },
    masterUpdateForm(obj,arg,label) {
      console.log('masterUpdateForm',obj);
      if(label == '客户名称') {
        this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').value = ''
        let currentForm = this.customerData.find(p=>p.value == arg)
        this.orderFormItems[1].formItems.form.find(p => p.label == '客户地址').value = currentForm['customerAddress']
        this.orderFormItems[1].formItems.form.find(p => p.label == '客户备注').value = currentForm['customerRemark']
        this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').options = currentForm['contacts'].map(p=>({label:p.name,value:p.id}))
        if(this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').options.length!==0) this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').value = this.orderFormItems[1].formItems.form.find(p => p.label == '客户联系人').options[0].value
      }
    },
    assistantUpdateForm(arg){

    },
    backEvent(){
        this.$refs.formItems.clearForm()
        this.$refs.formItems.validateForm()
        this.$refs.formItems.resetForm()
        this.editDialogFormItems.form.forEach(p=>p.value='')
        this.editDialogTitleVisible = false
    },
    saveEvent(){
      if(this.$refs.formItems.validateForm()){
        if(this.editDialogTitle == '新增')this.productInfoData.push(this.addTableData)
        if(this.editDialogTitle == '编辑'){
          this.productInfoData[this.productInfoData.indexOf(this.selectionData[0])] = Object.assign( this.productInfoData[this.productInfoData.indexOf(this.selectionData[0])],this.addTableData)
        }
        this.backEvent()
      }
    },
    updateForm(arg){
      console.log(arg)
      if(arg.status == "进行中") {
        this.editDialogFormItems.form.find(p=>p.name == 'endDate').value = ""
        arg.endDate = ""
      }
      if(arg.status == "已完成") {
        this.editDialogFormItems.form.find(p=>p.name == 'endDate').value = dayjs().format('YYYY-MM-DDT12:00:00')
        arg.endDate = dayjs().format('YYYY-MM-DDT12:00:00')
      }
      this.addTableData = arg
    },
    projectSaveEvent(){
      console.log(this.customerData,!this.customerData.some(y=>y.value == this.isHasValue))
      let allFormData = {}
      this.orderFormItems.map(item => {
          item.formItems.form.map(p=>{
            allFormData[p.name] = p.value
          })
      })
      this.orderMessageFormItems.map(item => {
          item.formItems.form.map(p=>{
            allFormData[p.name] = p.value
          })
      })

       let isAllRight = this.$refs.coolForm.every(item=>{
           return item.validateForm() == true
        })
        console.log(allFormData,isAllRight)
      if(isAllRight && this.$refs.atherCoolForm[0].validateForm()){

        if(!this.customerData.some(y=>y.value == this.isHasValue)) {
            Vue.prototype.$notify.info({
              title: '请输入正确的客户名称，勿手动修改，谢谢！！！',
              message: '请输入正确的客户名称，勿手动修改，谢谢！！！',
              duration: 2000,
            })
        }else{
          if (this.isEditData) {
            this.productInfoData.map(item => {
              item = Object.assign(item, {
                projectName: this.isEditData.projectName,
                formno: this.isEditData.formno
              })
            })
            allFormData = Object.assign(allFormData, {
              id: this.isEditData.id,
              vs: this.isEditData.vs,
              formno: this.isEditData.formno
            })
          }

          allFormData.customerName = this.customerData.find(p=>p.value == allFormData.customerCode).label

          allFormData.customerContactName = this.customerData.find(p=>p.value ==allFormData.customerCode).contacts.find(p=>p.id ==allFormData.customerContactCode).name

          allFormData.customerPhone = this.customerData.find(p=>p.value ==allFormData.customerCode).contacts.find(p=>p.id ==allFormData.customerContactCode).mobilePhone

          allFormData.customerEmail = this.customerData.find(p=>p.value ==allFormData.customerCode).contacts.find(p=>p.id ==allFormData.customerContactCode).email

          if(allFormData.installCompanyCode.length!==0) allFormData.installCompanyName = this.orderFormItems[2].formItems.form.find(p=>p.label== '安装公司').options.find(p=>p.value == allFormData.installCompanyCode).label

          if(allFormData.designCompanyCode.length!==0) allFormData.designCompanyName = this.orderFormItems[2].formItems.form.find(p=>p.label== '设计公司').options.find(p=>p.value == allFormData.designCompanyCode).label

          if(allFormData.developerCode.length!==0) allFormData.developerName = this.orderFormItems[2].formItems.form.find(p=>p.label== '建筑商').options.find(p=>p.value == allFormData.developerCode).label

          axiosDict[apiName].post(this.urlCreateOrEdit, {
            hdr: allFormData,
            dtls: this.productInfoData
          }).then(res => {
            console.log(res)
            window.parent.Vue.prototype.$notify.success({
              title: '保存成功',
              message: '保存成功',
              duration: 3000,
            })
            getDialog(window.parent.vm.dialogs, 'dialog1').visible = !getDialog(window.parent.vm.dialogs, 'dialog1').visible
            window.parent.vm.$refs.masterView.query()
          })
        }
      }
    },
    buttonEvent(args){
      switch (args.currentTarget.textContent.trim()) {
        // case '导入产品':
        // {
        //       this.importProductDialogVisible = true
        //       break
        // }
        case '新增' :
        {
           this.editDialogTitle = '新增'
           this.editDialogFormItems.form.find(p=>p.name == 'status').value = "进行中"
           this.editDialogTitleVisible = true
           break
        }
        case '编辑' :
        {
          this.editDialogTitle = '编辑'
          this.editDialogFormItems.form.map(item=>{
            for(let i in this.selectionData[0]){
              if(i == item.name)item.value = this.selectionData[0][i]
            }
          })
          this.editDialogTitleVisible = true
          break
        }
        case '删除' :
        {
          this.selectionData.forEach(p => {
            this.productInfoData.splice(this.productInfoData.indexOf(p), 1)
          })
          vm.$refs.coolTable.$refs.table.clearSelection()
          break
        }
      }
    }
  }
})
