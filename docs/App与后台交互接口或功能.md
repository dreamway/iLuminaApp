# App与后台交互接口说明

## 1. 用户管理相关接口

### 1.1 用户登录
- 接口：`/api/v1/auth/login`
- 方法：POST
- 功能：用户登录认证
- 参数：
  - username: 用户名
  - password: 密码
- 返回：
  - token: 访问令牌
  - user_info: 用户基本信息

### 1.2 用户信息
- 接口：`/api/v1/users/profile`
- 方法：GET
- 功能：获取用户详细信息
- 权限：需要登录

## 2. 客户管理相关接口

### 2.1 客户列表
- 接口：`/api/v1/customers`
- 方法：GET
- 功能：获取客户列表
- 参数：
  - page: 页码
  - limit: 每页数量
  - search: 搜索关键词

### 2.2 客户创建
- 接口：`/api/v1/customers`
- 方法：POST
- 功能：创建新客户
- 参数：
  - name: 姓名
  - phone: 电话
  - gender: 性别
  - birth_date: 出生日期
  - other_info: 其他信息

### 2.3 客户信息更新
- 接口：`/api/v1/customers/{id}`
- 方法：PUT
- 功能：更新客户信息

## 3. 检测相关接口

### 3.1 创建检测记录
- 接口：`/api/v1/detections`
- 方法：POST
- 功能：创建新的检测记录
- 参数：
  - customer_id: 客户ID
  - detection_type: 检测类型
  - questionnaire_data: 问卷数据

### 3.2 上传检测图片
- 接口：`/api/v1/detections/{id}/images`
- 方法：POST
- 功能：上传检测图片
- 参数：
  - image_file: 图片文件
  - image_type: 图片类型（左眼/右眼）

### 3.3 获取AI分析结果
- 接口：`/api/v1/detections/{id}/analysis`
- 方法：GET
- 功能：获取AI分析结果
- 返回：
  - scores: 五维度评分
  - recommendations: 改善建议
  - product_suggestions: 产品推荐

### 3.4 检测历史记录
- 接口：`/api/v1/customers/{id}/detections`
- 方法：GET
- 功能：获取客户的检测历史记录

## 4. 数据同步接口

### 4.1 数据上传
- 接口：`/api/v1/sync/upload`
- 方法：POST
- 功能：上传本地数据到服务器
- 参数：
  - sync_type: 同步类型
  - data: 同步数据

### 4.2 数据下载
- 接口：`/api/v1/sync/download`
- 方法：GET
- 功能：从服务器下载数据
- 参数：
  - last_sync_time: 上次同步时间

## 5. 系统配置接口

### 5.1 获取系统配置
- 接口：`/api/v1/config`
- 方法：GET
- 功能：获取系统配置信息
- 返回：
  - app_version: App版本信息
  - update_url: 更新地址
  - server_config: 服务器配置

### 5.2 获取产品信息
- 接口：`/api/v1/products`
- 方法：GET
- 功能：获取产品列表和详情
