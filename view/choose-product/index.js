/**
 *
 * @authors Your Name (you@example.org)
 * @date    2019-01-07 11:38:37
 * @version $Id$
 */
function postSelection(args, source) {
      console.log(5,'postSelection',args)
      let data = {
        data:vm.HASCHOOSEDATA,
        closeDialog:true
      }
      source.postMessage({ method: 'passSelection', args: { data: data, to: args.to } }, '*')
    }

function alertData(args) {
  console.log(6,'alertData',args)
  // Vue.prototype.$alert(JSON.stringify(args))
}

var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
        el: '#root',
        data: {
          // url合集
          urlGetList: apiDict[apiName] + '/quotation/dtlList',
          selected: [],
          items: [],
          // cool views
          showQuery:true,
          hdrTableData:{
            data:[],
            showPage:true,
            total:0,
            pageSize:10,
            currentPage:1,
            layout: 'total, sizes, prev, pager, next, jumper',
            cellStyle:{
            height: '30px',
            padding: '5px 0'
          },
            columns:[{
		        type: 'selection',
		      }, {
		        type: 'index',
		        label: '序号'
		      }, {
		        prop: 'buildingName',
		        label: '建筑名称'
		      },
		      {
		        prop: 'floor',
		        label: '楼层'
		      },
		      {
		        prop: 'roomNo',
		        label: '房间号'
		      },
		      {
		        prop: 'windowNo',
		        label: '窗号'
		      },
		      {
		        prop: 'productType',
		        label: '产品类型'
		      },
		      {
		        prop: 'productSubtypes',
		        label: '产品子类型'
		      },
		      {
		        prop: 'reqDeliveryDate',
		        label: '要求到货日期'
		      },
		      {
		        prop: 'reqApprovalDate',
		        label: '要求核准日期'
		      },
		      {
		        prop: 'actualArrivalDate',
		        label: '实际到货日期'
		      },
		      {
		        prop: 'actualApprovalDate',
		        label: '实际核准日期'
		      },
          {
            prop:'qty',
            label:"数量"
          }
          ],

          },

          // 查表数据及各项内容
          // 表格样式
          tableLoading: false,
          cellRow: {
            height: '30px',
            padding: '5px 0'
          },
          //主表数据
          productData: [],
          total: 0,
          layout: 'total, sizes, prev, pager, next, jumper',
          condition: {
            current: 1,
            offset: 10,
            dlt: []
          },
          // 查询条件
          originCondition: [
            {
              value: '',
              name: '建筑名称',
              dataType: 'string',
              fieldName: 'code',
              form: 'select',
              options:[]
            },
            {
              value: '',
              name: '楼层',
              dataType: 'string',
              fieldName: 'name',
              form: 'select',
              options:[]
            },
            {
              value: '',
              name: '房间号',
              dataType: 'string',
              fieldName: 'serial',
              form: 'select',
              options:[]
            },
            {
              value: '',
              name: '窗号',
              dataType: 'string',
              fieldName: 'no',
              form: 'select',
              options:[]
            },
            {
              value: '',
              name: '产品类型',
              dataType: 'string',
              fieldName: 'type',
              form: 'input'
            },
            {
              value: '',
              name: '产品类型',
              dataType: 'string',
              fieldName: 'type',
              form: 'input'
            }
          ],
          // 按钮组

          buttons: [{
              text: '查找',
              size: 'mini',
              icon: '#iconchaxun',
              disabled: false
            }
          ],
          HASCHOOSEDATA:null,
          projectCode:location.hash.split('#')[2]
        },
        created() {
          console.log(this.projectCode)
          for (let i in window.coolLocals) {
            for (let p in JSON.parse(window.coolLocals[i])) {
              this[p] = JSON.parse(window.coolLocals[i])[p]
            }
          }
        },
        mounted() {
        	this.getData()
        },
        methods: {
          // 表格多选操作
          selection(arg) {
          	this.HASCHOOSEDATA = arg
          },
          getCondition: function(playload) {

          },
          // 主表查询
          // 主表查询
          getData() {
             axiosDict['warehouse'].post(this.urlGetList,{projectCode: this.projectCode,buildOrder:false})
              .then(res=>{
                this.hdrTableData.data = res
              })
          },
          confirmData() {

          },
          // 按钮组
          buttonsevent(args) {
            switch (args.currentTarget.textContent.trim()) {
              case '查找':
                {
                  this.getData()
                  break
                }
              default:
                break
            }
          },
        }
      })
