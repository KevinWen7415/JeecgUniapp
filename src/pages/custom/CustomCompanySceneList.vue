<route lang="json5" type="page">
{
layout: 'default',
style: {
navigationBarTitleText: 'custom_company_scene',
navigationStyle: 'custom',
},
}
</route>
<template>
  <PageLayout navTitle="客户现场"  backRouteName="CustomCompanySceneList" routeMethod="pushTab" @navBack="handleExitCustomScene">
    <view class="wrap">
      <z-paging
          ref="paging"
          :fixed="false"
          v-model="dataList"
          @query="queryList"
          :default-page-size="15"
      >
        <template v-for="item in dataList" :key="item.id">
          <wd-swipe-action>
            <view class="list" @click="handleEdit(item)">
              <template v-for="(cItem, cIndex) in columns" :key="cIndex">
                <view v-if="cIndex < 3" class="box" :style="getBoxStyle">
                  <view class="field ellipsis">{{ cItem.title }}</view>
                  <view class="value cu-text-grey">{{ item[cItem.dataIndex] }}</view>
                </view>
              </template>
            </view>
            <template #right>
              <view class="action">
                <view class="button" @click="handleAction('del', item)">删除</view>
              </view>
            </template>
          </wd-swipe-action>
        </template>
      </z-paging>
      <view class="add u-iconfont u-icon-add" @click="handleAdd"></view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { http } from '@/utils/http'
import usePageList from '@/hooks/usePageList'
import {columns} from './CustomCompanySceneData';
import Popup from '@/components/Popup/Popup.vue'
import { useMessage } from "wot-design-uni";
import { useUserStore } from "@/store"; // 导入 Popup 组件
const userStore = useUserStore()
const message = useMessage()
defineOptions({
  name: 'CustomCompanySceneList',
  components: {
    Popup // 注册组件
  },
  options: {
    styleIsolation: 'shared',
  }
})
//分页加载配置
let { toast, router, paging, dataList, queryList } = usePageList('/custom/customCompanyScene/list');

//样式
const getBoxStyle = computed(() => {
  return { width: "calc(33% - 5px)" }
})

// 其他操作
const handleAction = (val, item) => {
  if (val == 'del') {
    http.delete("/custom/customCompanyScene/delete?id="+item.id,{id:item.id}).then((res) => {
      toast.success('删除成功~')
      paging.value.reload()
    })
  }
}

// go 新增页
const handleAdd = () => {
  router.push({
    name: 'CustomCompanySceneForm'
  })
}

//go 编辑页
const handleEdit = (record) => {
  router.push({
    name: 'CustomCompanySceneForm',
    params: {dataId: record.id},
  })
}

const handleExitCustomScene = () =>{
  message
    .confirm({
      title: '提示',
      msg: '确定退出吗？',
    })
    .then(() => {
      userStore.clearUserInfo()
      router.replaceAll({ name: 'login' })
    })
}

onMounted(() => {
  // 监听刷新列表事件
  uni.$on('refreshList', () => {
    queryList(1,10)
  })
})
</script>

<style lang="scss" scoped>
.wrap {
  height: 100%;
}
:deep(.wd-swipe-action) {
  margin-top: 10px;
  background-color: #fff;
}
.list {
  padding: 10px 10px;
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  .box {
    width: 33%;
    .field {
      margin-bottom: 10px;
      line-height: 20px;
    }
  }
}
.action {
  width: 60px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    color: #fff;
    &:first-child {
      background-color: #fa4350;
    }
  }
}
.add {
  height: 70upx;
  width: 70upx;
  text-align: center;
  line-height: 70upx;
  background-color: #fff;
  border-radius: 50%;
  position: fixed;
  bottom: 80upx;
  right: 30upx;
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
  color: #666;
}
</style>
