# `spring-app` 阶段六：双跑切换

## 目标

- 让 `root mock backend:8080` 与 `spring-app:8081` 可以同时运行
- 给 PC / H5 前端补统一的 API 目标切换层，便于同一套页面合同分别验证两套后端
- 在不破坏当前联调路径的前提下，把“默认读写切到 `spring-app`”准备好

## 当前阶段状态

- 状态：`已完成`
- 当前默认下一步：切入主线 6 阶段一“正式上传底座”

## 阶段结果

- `spring-app` 本地默认端口已切到 `8081`
- PC / H5 前端都已新增 `apiBase` 解析层，当前支持：
  - `VITE_API_BASE` 作为最高优先级显式覆盖
  - `VITE_API_TARGET=mock|spring`
  - `VITE_ROOT_MOCK_API_BASE`
  - `VITE_SPRING_API_BASE`
  - 浏览器 query `?apiTarget=mock|spring`
  - `localStorage` 中的 `youqinggong.api.target`
- PC / H5 当前默认 API 目标已切到 `spring`；root mock 继续通过 query、env 与本地缓存保留联调 fallback
- 双跑默认顺序当前固定为：
  1. `VITE_API_BASE`
  2. query `?apiTarget=mock|spring`
  3. `localStorage['youqinggong.api.target']`
  4. `VITE_API_TARGET`
  5. 默认 `spring`
- 已重新验证：
  - `frontend/src/services/apiBase.test.js`
  - `frontend_mobile_h5/src/services/apiBase.test.js`
  - `frontend` `npm run build`
  - `frontend_mobile_h5` `npm run build`
  - `backend/spring-app` 关键测试组：`UploadApiControllerTest, TaskFileIntegrationFlowTest, MessageRoomMobileFlowTest, MessageRoomApiControllerTest`

## 保留边界

- root mock backend 仍保留 `8080`，继续作为联调 fallback
- fallback 仍存在于少量页面的空态 / 兼容读模型，不代表默认主链仍走 mock
- 双跑阶段已经收口为“默认 spring + 可显式切回 mock”，而不是“双端都默认 mock”

## 最后一步

- 切入下一条主线：文件上传 / 实时事件 / IM 回写正式化
