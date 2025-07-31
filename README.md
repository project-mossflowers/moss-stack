# Moss Stack

一个现代化的全栈应用模板，展示了如何使用 FastAPI + React + TypeScript 构建完整的 CRUD 应用。

## 🏗️ 技术栈

### 后端

- **FastAPI** - 现代 Python Web 框架
- **SQLModel** - 类型安全的 ORM
- **PostgreSQL** - 关系型数据库
- **Alembic** - 数据库迁移工具
- **JWT** - 身份认证

### 前端

- **React** + **TypeScript** - 类型安全的组件开发
- **TanStack Router** - 文件路由系统
- **TanStack Query** - 服务端状态管理和缓存
- **React Hook Form** + **Zod** - 表单管理和验证
- **Shadcn/ui** - 现代化 UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架

## 🚀 快速开始

### 开发环境

```bash
# 一键启动开发环境（包含热重载）
./scripts/dev-deploy.sh

# 生成 TypeScript API 客户端
./scripts/generate-client.sh
```

### 生产环境

```bash
# 一键部署生产环境
./scripts/prod-deploy.sh
```

## 📁 项目结构

```plaintext
moss-stack/
├── backend/          # FastAPI 后端
│   ├── src/
│   │   ├── routes/   # API 路由模块
│   │   ├── models/   # 数据模型
│   │   └── core/     # 核心功能（认证、安全）
├── frontend/         # React 前端
│   ├── src/
│   │   ├── routes/   # 文件路由
│   │   ├── components/ # UI 组件
│   │   └── api/      # 自动生成的 API 客户端
└── scripts/          # 构建和部署脚本
```

## 💡 核心特性

### 🔄 服务端分页

实现了高效的服务端分页系统：

**后端 API**  

```python
@router.get("/", response_model=ItemsPublic)
async def read_items(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
):
    # 高效的分页查询实现
```

**响应格式**  

```json
{
  "data": [...],
  "page": 1,
  "size": 10,
  "total": 100,
  "pages": 10
}
```

**前端状态管理**  

```typescript
// URL 状态持久化
const { page, size } = Route.useSearch()

// 类型安全的导航
const handlePageChange = (newPage: number) => {
  navigate({
    to: '/items',
    search: (prev: any) => ({ ...prev, page: newPage }),
  })
}
```

### 🎯 CRUD 最佳实践

#### 1. 创建功能 (Create)

- 使用 `react-hook-form` + `zod` 进行表单验证
- 自动缓存失效确保数据一致性
- 统一的错误处理和加载状态

```typescript
const createMutation = useMutation({
  ...itemsCreateItemMutation(),
  onSuccess: () => {
    toast.success("Item created successfully")
    // 智能缓存失效
    queryClient.invalidateQueries({ 
      queryKey: itemsReadItemsQueryKey() 
    })
    setOpen(false)
    form.reset()
  }
})
```

#### 2. 数据表格 (Read)

- 服务端分页、排序、筛选
- `@tanstack/react-table` 强大的表格功能
- URL 状态同步，支持书签和分享

```typescript
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  pageCount: pagination?.pages || 1,
  // ... 其他配置
})
```

#### 3. 编辑功能 (Update)

- 预填充现有数据
- 乐观更新提升用户体验
- 表单验证和错误处理

#### 4. 删除功能 (Delete)

- 安全的删除确认对话框
- 防误操作保护
- 清晰的用户反馈

### 🔐 认证系统

- JWT Token 自动管理
- 路由级别的权限控制
- Token 刷新和自动登出

### 🎨 用户界面

- 响应式设计适配所有设备
- 一致的设计语言
- 优雅的加载和错误状态
- 无障碍访问支持

## 🛠️ 开发指南

### 添加新的 CRUD 模块

1. **后端模型定义**

```python
# backend/src/routes/{module}/models.py
class EntityBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)

class Entity(EntityBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # ... 其他字段
```

2. **API 路由实现**

```python
# backend/src/routes/{module}/route.py
@router.get("/", response_model=EntitiesPublic)
async def read_entities(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
):
    # 分页查询实现
```

3. **前端组件开发**

```typescript
// frontend/src/routes/_app/{module}/route.tsx
export const Route = createFileRoute('/_app/{module}')({
  component: ModuleComponent,
  validateSearch: (search) => moduleSearchSchema.parse(search),
})
```

4. **生成 API 客户端**

```bash
./scripts/generate-client.sh
```

### 数据库迁移

```bash
# 创建迁移
cd backend
uv run alembic revision --autogenerate -m "Add new entity"

# 应用迁移
uv run alembic upgrade head
```

## 🔧 环境配置

复制 `.env.example` 到 `.env` 并配置：

**必需变量：**

- `SECRET_KEY` - JWT 密钥
- `POSTGRES_*` - 数据库连接
- `FIRST_SUPERUSER_*` - 初始管理员账户

**可选变量：**

- `SENTRY_DSN` - 错误监控
- SMTP 配置 - 邮件功能

## 📊 性能优化

1. **前端优化**
   - TanStack Query 智能缓存
   - 组件懒加载
   - 服务端分页减少数据传输

2. **后端优化**
   - 异步数据库操作
   - 高效的分页查询
   - 基于角色的数据过滤

3. **部署优化**
   - Docker 多阶段构建
   - Nginx 静态资源服务
   - 生产环境健康检查

## 🎯 项目亮点

- ✅ **类型安全** - 端到端 TypeScript 支持
- ✅ **自动化** - API 客户端自动生成
- ✅ **现代化** - 使用最新的技术栈
- ✅ **可扩展** - 清晰的架构和模式
- ✅ **开发体验** - 热重载和自动化工具
- ✅ **生产就绪** - Docker 部署和监控

这个项目为现代 Web 应用开发提供了一个完整的模板，可以快速扩展到任何业务场景。
