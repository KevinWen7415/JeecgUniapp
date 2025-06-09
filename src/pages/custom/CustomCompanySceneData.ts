import { render } from '@/common/renderUtils';
//列表数据
export const columns = [
    {
    title: '公司名称',
    align:"center",
    dataIndex: 'companyName'
   },
   {
    title: '记录生成时间',
    align:"center",
    dataIndex: 'generationTime'
   },
   {
    title: '上次上传时间',
    align:"center",
    dataIndex: 'lastUploadTime'
   },
   {
    title: '上次上传状态',
    align:"center",
    dataIndex: 'lastUploadStatus'
   },
   {
    title: '照片数量',
    align:"center",
    dataIndex: 'photoCount'
   },
   {
    title: '状态',
    align:"center",
    dataIndex: 'status'
   },
   {
    title: '描述',
    align:"center",
    dataIndex: 'description'
   },
   {
    title: '租户ID',
    align:"center",
    dataIndex: 'tenantId'
   },
];