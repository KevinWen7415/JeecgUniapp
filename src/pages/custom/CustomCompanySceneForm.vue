<route lang="json5" type="page">
{
layout: 'default',
style: {
navigationStyle: 'custom',
navigationBarTitleText: 'custom_company_scene',
},
}
</route>

<template>
  <PageLayout :navTitle="navTitle" :backRouteName="backRouteName">
    <scroll-view class="scrollArea" scroll-y>
      <view class="form-container">
        <wd-form ref="form" :model="myFormData">
          <wd-cell-group border>
            <view class="{ 'mt-14px': 0 == 0 }">
              <wd-input
                label-width="100px"
                v-model="myFormData['companyName']"
                :label="get4Label('公司名称')"
                name='companyName'
                prop='companyName'
                placeholder="请选择公司名称"
                :rules="[
                    { required: true, message: '请输入公司名称!'},
                  ]"
                clearable
              />
              <wd-input
                label-width="150px"
                v-model="myFormData['generationTime']"
                label="记录生成时间"
                name='generationTime'
                prop='generationTime'
                disabled
              />


            </view>
          </wd-cell-group>
        </wd-form>

        <!-- 照片分类树结构 -->
        <view class="photo-category" v-for="(category, index) in photoCategories" :key="index">
          <uni-section :title="category.photoTypeName" type="line" padding style="width: 100%;">
            <uni-grid :column="3" :highlight="true" style="width: 100%;" :showBorder="true"  class="custom-grid">
                <view v-if="category.children && category.children.length > 0" style="display: flex; flex-wrap: wrap; ">
                  <uni-grid-item v-for="(item, idx) in category.children" :index="idx" :key="idx"  style="display: flex; align-items: center; justify-content: center;" >
                    <view class="grid-item-box"  @click="triggerFilePicker(index)" style="background-color: #fff; width: 100%;  box-sizing: border-box; padding: 10px;">
<!--                      <uni-file-picker limit="1" ref="filePicker"
                        file-mediatype="image"  :title="item.label">
                      </uni-file-picker>-->
                      <view class="image-container">
                        <online-image
                          v-model:value="item.filePath"
                          :name="item.photoTypeName"
                          :key="idx"
                          :max-num="1"
                          @upload-success="handleUploadSuccess"
                          @afterRemove="handleAfterFileRemove"
                        ></online-image>
                        <text class="text">{{ item.photoTypeName }}</text>
                      </view>
                    </view>
                  </uni-grid-item>
                  <uni-grid-item :index="category.children.length?  category.children.length + 1 : 1  " :key="category.children.length?  category.children.length + 1 : 1 "
                  style="display: flex; align-items: center; justify-content: center;" >
                      <view class="grid-item-box" style="background-color: #fff; width: 100%;  box-sizing: border-box; padding: 10px;">
                        <wd-button   style="width: 50px; "  @click="handleAddCustomCategory(category)" >自定义</wd-button>
                      </view>
                  </uni-grid-item>
                </view>
            </uni-grid>
          </uni-section>
        </view>
      </view>
    </scroll-view>
    <view class="footer">
      <view class="button-group">
        <wd-button :disabled="loading" block :loading="loading" @click="handleSubmit">保存</wd-button>
        <wd-button v-if="dataId"  style="margin-top:10" :disabled="loading" block :loading="loading" @click="handleUploadPhoto" type="success">上传照片</wd-button>
      </view>
    </view>
  </PageLayout>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { http } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { useRouter } from '@/plugin/uni-mini-router'
import { ref, onMounted, computed, reactive } from 'vue'
import { UploadMethod } from "wot-design-uni/components/wd-upload/types";
import { useUserStore } from "@/store";
import { getFileAccessHttpUrl } from '@/common/uitls'
import { getEnvBaseUploadUrl,getEnvBaseUrl } from '@/utils'
import { isString } from '@/utils/is'
import { formatDateTimeWithSeconds } from '@/utils/timeUtils'
import OnlineImage from "@/components/online/view/online-image.vue";
import _ from 'lodash'

const toast = useToast()
const VITE_UPLOAD_BASEURL = `${getEnvBaseUrl()}/sys/common/upload`
defineOptions({
  name: 'CustomCompanySceneForm',
  options: {
    styleIsolation: 'shared',
  },
})

const router = useRouter()
const form = ref(null)
// 定义响应式数据
const myFormData = reactive({})
const loading = ref(false)
const navTitle = ref('新增')
const dataId = ref('')
const backRouteName = ref('CustomCompanySceneList')
const photoCategories = ref([])
// 在 setup 中定义 ref
const filePicker = ref([]);


const imageStyles= {
    width: 64,
    height: 64,
    border: {
      radius: '50%'
    }
  };


const triggerFilePicker = (index) => {
  // 通过 ref 调用文件选择器的点击方法（需确认组件是否支持）
  if (filePicker.value[index]?.choose) {
    filePicker.value[index].choose();
  }
}

const formatDateTime = (type,  value) => {
  return formatDateTimeWithSeconds(value);
}

const handleUploadSuccess = ({  file,fileList, response }) => {
  console.log('handleUploadSuccess', file,fileList, response);
  handleSubmit();
}

const handleAfterFileRemove = ({file, fileList}) => {
  console.log('handleAfterFileRemove', file, fileList);
}

// 定义 initForm 方法
const initForm = (item) => {
  console.log('initForm item', item)
  if(item?.dataId){
    dataId.value = item.dataId;
    navTitle.value = item.dataId?'编辑':'新增';
    initData();
  } else {
    // 新增时默认填充当前时间
    myFormData.generationTime = getCurrentTime();
  }
}
// 初始化数据
const initData = () => {
  http.get("/custom/customCompanyScene/queryById",{id:dataId.value}).then((res) => {
    if (res.success) {
      let obj = res.result
      if (obj.photoTrees && obj.photoTrees.length > 0){
        photoCategories.value = obj.photoTrees
      }else {
        // 获取照片分类数据
        http.get("/custom/customCrmPhotoType/listTreeEnabled").then((res) => {
          if (res.success && res.result) {
            const processed = res.result;
            console.log('processed categories:', processed) // 调试日志
            if (processed && processed.length > 0){
              for (let i = 0; i < processed.length; i++) {
                processed[i] = covertPhotoTypeTreeToDataTree(processed[i]);
              }
            }
            photoCategories.value = processed
          }else{
            toast.error(res?.message || '照片分类加载失败！')
          }
        })
      }
      Object.assign(myFormData, { ...obj })
    }else{
      toast.error(res?.message || '表单加载失败！')
    }
  })
}

const covertPhotoTypeTreeToDataTree = (photoTree)=>{
  if (!photoTree){
    return photoTree;
  }
  //将类型id记录到另一个字段
  photoTree.photoTypeId = photoTree.id;
  photoTree.id = null;

  if (photoTree.children && photoTree.children.length > 0){
    for (let i = 0; i < photoTree.children.length; i++) {
      photoTree.children[i] = covertPhotoTypeTreeToDataTree(photoTree.children[i]);
    }
  }
  return photoTree;
}

// const

const handleSuccess = () => {
  uni.$emit('refreshList');
  // router.back();
  if (_.isEmpty(dataId.value)){
    router.push({
      name: 'CustomCompanySceneList'
    })
  }
}

// 当前选中的分类索引
const selectedCategoryIndex = ref<number | null>(null)

// 新增分类名称
const newCategoryName = ref<string>('')

// 点击“自定义”按钮时触发
const handleAddCustomCategory = (category) => {
  uni.showModal({
    title: '新增照片分类',
    editable: true, // 支持输入
    success: (res) => {
      if (res.confirm && res.content) {
        const categoryName = res.content.trim()
        if (!categoryName) {
          toast.error('请输入有效的分类名称')
          return
        }

        // 添加到第一个分类下（可根据需求调整）
        const targetCategory = category
        if (targetCategory && targetCategory.children) {
          targetCategory.children.push({
            typeLevel: 1,
            photoTypeName: categoryName,
            isLeaf: true,
            files: []
          })
        } else {
          toast.error('无法添加分类，请检查分类结构')
        }
      }
    },
  })
}

// 提交表单
const handleSubmit = () => {
  console.log('handleSubmit', myFormData)
  let url = dataId.value?'/custom/customCompanyScene/edit':'/custom/customCompanyScene/add';

  // 将照片分类数据合并到表单数据
  myFormData.photoTrees = photoCategories.value

  form.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        loading.value = true;
        http.post(url,myFormData).then((res) => {
          loading.value = false;
          if (res.success) {
            toast.success('保存成功');
            handleSuccess()
          }else{
            toast.error(res?.message || '表单保存失败！')
          }
        })
      }
    })
    .catch((error) => {
      console.log(error, 'error')
      loading.value = false;
    })
}


const handleUploadPhoto = () => {
  let url =  '/custom/customCompanyScene/uploadPhoto';
  // 将照片分类数据合并到表单数据
  myFormData.photoTrees = photoCategories.value

  form.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        loading.value = true;
        http.post(url,myFormData).then((res) => {
          loading.value = false;
          if (res.success) {
            toast.success('照片上传成功');
            handleSuccess()
          }else{
            toast.error(res?.message || '照片上传失败！')
          }
        })
      }
    })
    .catch((error) => {
      console.log(error, 'error')
      loading.value = false;
    })
}

// 标题
const get4Label = computed(() => {
  return (label) => {
    return label && label.length > 4 ? label.substring(0, 4) : label;
  }
})

// 标题
const getFormSchema = computed(() => {
  return (dictTable,dictCode,dictText) => {
    return {
      dictCode,
      dictTable,
      dictText
    };
  }
})
/**
 * 获取日期控件的扩展类型
 * @param picker
 * @returns {string}
 */
const getDateExtendType = (picker: string) => {
    let mapField = {
      month: 'year-month',
      year: 'year',
      quarter: 'quarter',
      week: 'week',
      day: 'date',
    }
    return picker && mapField[picker]
      ? mapField[picker]
      : 'date'
}
//设置pop返回值
const setFieldsValue = (data) => {
   Object.assign(myFormData, {...data })
}

// 新增时间格式化函数
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

// 新增照片分类数据处理
// const processPhotoCategories = (data) => {
//   return data.map(parent => ({
//     id: parent.id,
//     label: parent.photoTypeName,
//     children: parent.children && parent.isLeaf === false ? parent.children.filter(child => child.isLeaf).map(child => ({
//       label: child.photoTypeName,
//       id: child.id,
//       files: []
//     })) : []
//   }))
// }

// 处理照片上传
const handlePhotoUpload = (category, item, files) => {
  const target = photoCategories.value.find(c => c.value === category.value)
  if (target) {
    const child = target.children.find(c => c.value === item.value)
    if (child) {
      child.filePaths = files.map(file => file.path)
    }
  }
}



// onLoad 生命周期钩子
onLoad((option) => {
  initForm(option)
})
</script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  padding: 10px 20px;
  padding-bottom: calc(#{env(safe-area-inset-bottom)} + 10px);
}

.category-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
}

.category-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 10px;
  width: 100%;
}

.file-path-info {
  margin-top: 8px;
  font-size: 12px;
  color: #333;
  text-align: left;
  width: 100%;
}

.grid-item-box {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;     // 水平居中
  justify-content: center; // 垂直居中
  height: 120px;
  min-height: 120px; // 添加最小高度保证统一

  /* Vue3 推荐写法 */
  :deep(.uni-file-picker) {
    width: 95% !important;
    height: 95% !important;
    margin: 0 auto;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    flex-direction: column !important;
    background-color: #f9f9f9 !important;
    border: 1px dashed #ddd !important;
    border-radius: 4px !important;

    &::after {
      display: block;
      margin-top: 8px;
      color: #666;
      font-size: 12px;
    }
  }
}

.grid-item-box-row {
  flex: 1;
  // position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
}

.custom-grid {
  // 添加容器整体边框
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden; // 确保边框圆角生效

}

// 确保网格项高度一致
.grid-item-box {
  border-top: 1px solid #e4e7ed ;
  height: 120px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

// 修复间距问题
.custom-grid {
  :deep(.uni-grid-row) {
    margin-bottom: 0 !important;
  }
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px; // 设置两个按钮之间的垂直间距为 10px
}

</style>
