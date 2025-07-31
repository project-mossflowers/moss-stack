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
├── backend/                    # FastAPI Python 后端
│   ├── src/
│   │   ├── routes/            # API 路由模块
│   │   │   ├── auth/          # 认证相关路由
│   │   │   ├── users/         # 用户管理路由
│   │   │   ├── items/         # 物品管理路由
│   │   │   └── private/       # 私有 API 路由
│   │   ├── core/              # 核心功能
│   │   │   └── security.py    # JWT 认证和密码加密
│   │   ├── migrations/        # Alembic 数据库迁移文件
│   │   └── utils/             # 工具函数
│   └── pyproject.toml         # Python 依赖管理
├── frontend/                   # React TypeScript 前端
│   ├── src/
│   │   ├── routes/            # 文件路由系统
│   │   │   ├── _app/          # 需要认证的页面
│   │   │   │   ├── items/     # 物品管理页面
│   │   │   │   └── dashboard/ # 仪表板页面
│   │   │   └── _auth/         # 认证相关页面
│   │   ├── components/        # 可复用 UI 组件
│   │   │   ├── ui/            # shadcn/ui 基础组件
│   │   │   └── layout/        # 布局组件
│   │   ├── api/               # 自动生成的 API 客户端
│   │   ├── hooks/             # 自定义 React Hooks
│   │   └── integrations/      # 第三方集成配置
│   └── package.json           # Node.js 依赖管理
├── scripts/                   # 构建和部署脚本
│   ├── dev-deploy.sh          # 开发环境一键部署
│   ├── prod-deploy.sh         # 生产环境一键部署
│   └── generate-client.sh     # API 客户端生成脚本
├── docker-compose.yml         # 生产环境 Docker 配置
├── docker-compose.dev.yml     # 开发环境 Docker 配置
└── CLAUDE.md                  # Claude Code 项目指南
```

## 💡 核心特性

### 🔄 服务端分页、筛选和排序

实现了完整的服务端数据管理系统：

**后端 API**  

```python
@router.get("/", response_model=ItemsPublic)
async def read_items(
    session: AsyncSessionDep, 
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(default=10, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(default=None, description="Search in title and description"),
    sort_by: ItemSortField = Query(default=ItemSortField.created_at, description="Field to sort by"),
    sort_order: SortOrder = Query(default=SortOrder.desc, description="Sort order (asc/desc)"),
) -> Any:
    # 高效的分页、筛选和排序查询实现
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
// URL 状态持久化（支持所有筛选参数）
const { page, size, search, sort_by, sort_order } = Route.useSearch()

// 类型安全的导航
const handlePageChange = (newPage: number) => {
  navigate({
    to: '/items',
    search: (prev: any) => ({ ...prev, page: newPage }),
  })
}

// 交互式排序（通过 React Table 实现）
React.useEffect(() => {
  if (sorting.length > 0) {
    const sortField = sorting[0].id as ItemSortField
    const sortOrder = sorting[0].desc ? SortOrder.DESC : SortOrder.ASC
    
    navigate({
      to: '/items',
      search: (prev: any) => ({ 
        ...prev, 
        sort_by: sortField, 
        sort_order: sortOrder,
        page: 1 
      }),
    })
  }
}, [sorting, navigate])
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
- 实时搜索和交互式列排序

```typescript
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  manualSorting: true,
  pageCount: pagination?.pages || 1,
  // ... 其他配置
})

// 搜索功能
const handleSearch = () => {
  navigate({
    to: '/items',
    search: (prev: any) => ({ 
      ...prev, 
      search: searchInput || undefined, 
      page: 1 
    }),
  })
}

// 排序功能（通过点击列标题触发）
React.useEffect(() => {
  if (sorting.length > 0) {
    const sortField = sorting[0].id as ItemSortField
    const sortOrder = sorting[0].desc ? SortOrder.DESC : SortOrder.ASC
    
    navigate({
      to: '/items',
      search: (prev: any) => ({ 
        ...prev, 
        sort_by: sortField, 
        sort_order: sortOrder,
        page: 1 
      }),
    })
  }
}, [sorting, navigate])
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
from datetime import datetime
from enum import Enum

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class EntitySortField(str, Enum):
    name = "name"
    created_at = "created_at"
    updated_at = "updated_at"

class EntityBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)

class Entity(EntityBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
    # ... 其他字段
```

2. **API 路由实现**

```python
# backend/src/routes/{module}/route.py
from typing import Optional

@router.get("/", response_model=EntitiesPublic)
async def read_entities(
    session: AsyncSessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    sort_by: EntitySortField = Query(default=EntitySortField.created_at),
    sort_order: SortOrder = Query(default=SortOrder.desc),
):
    # 构建动态查询
    statement = select(Entity).where(Entity.owner_id == current_user.id)
    
    # 添加搜索条件
    if search:
        statement = statement.where(
            Entity.name.icontains(search)
        )
    
    # 添加排序
    if sort_order == SortOrder.desc:
        statement = statement.order_by(desc(getattr(Entity, sort_by)))
    else:
        statement = statement.order_by(asc(getattr(Entity, sort_by)))
    
    # 分页查询实现
    # ... 其他实现
```

3. **前端组件开发**

```typescript
// frontend/src/routes/_app/{module}/route.tsx
import { z } from 'zod'
import { EntitySortField, SortOrder } from '@/api/types.gen'

const entitySearchSchema = z.object({
  page: z.number().catch(1),
  size: z.number().catch(10),
  search: z.string().optional(),
  sort_by: z.enum(EntitySortField).catch(EntitySortField.CREATED_AT),
  sort_order: z.enum(SortOrder).catch(SortOrder.DESC),
})

export const Route = createFileRoute('/_app/{module}')({
  component: ModuleComponent,
  validateSearch: (search) => entitySearchSchema.parse(search),
})

function ModuleComponent() {
  const searchParams = Route.useSearch()
  
  const result = useQuery({
    ...getEntitiesQueryOptions(searchParams),
    placeholderData: (prevData) => prevData,
  })
  
  // 渲染交互式表格，支持排序、搜索、分页
  return <DataTable data={result.data?.data || []} searchParams={searchParams} />
}
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

- ✅ **类型安全** - 端到端 TypeScript 支持，从后端枚举到前端组件
- ✅ **自动化** - API 客户端自动生成，包含所有类型定义
- ✅ **现代化** - 使用最新的技术栈和最佳实践
- ✅ **可扩展** - 清晰的架构和模式，支持复杂的业务场景
- ✅ **开发体验** - 热重载、智能缓存、实时搜索等现代化功能
- ✅ **生产就绪** - Docker 部署、错误监控、性能优化
- ✅ **用户体验** - 响应式设计、交互式表格、无障碍访问支持
- ✅ **数据管理** - 服务端分页、筛选、排序，支持大规模数据集

这个项目为现代 Web 应用开发提供了一个完整的模板，可以快速扩展到任何业务场景。
