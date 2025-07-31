# moss-stack

## 前端 CRUD 实现指南 - 以 Item 为例

本项目展示了如何在现代 React 应用中实现完整的 CRUD（增删改查）功能。以下是基于 Item 实体的实现细节。

### 🏗️ 架构概览

我们的 CRUD 实现基于以下技术栈：

- **React** + **TypeScript** - 类型安全的组件开发
- **TanStack Query** - 服务端状态管理和缓存
- **React Hook Form** + **Zod** - 表单管理和验证
- **Shadcn/ui** - 现代化 UI 组件库
- **Sonner** - 优雅的 Toast 通知

### 📁 项目结构

```plaintext
frontend/src/routes/_app/items/
├── route.tsx                    # 主页面路由
├── -components/
│   ├── items-table.tsx         # 数据表格组件
│   ├── create-item-dialog.tsx  # 创建对话框
│   ├── edit-item-dialog.tsx    # 编辑对话框
│   └── delete-item-dialog.tsx  # 删除确认对话框
└── -schemas/
    └── index.ts                # 表单验证 schema
```

### 🔧 实现步骤

#### 1. 创建功能 (Create)

**核心特性：**

- 使用 `react-hook-form` + `zod` 进行表单验证
- 统一的错误处理和加载状态
- 成功后自动刷新表格数据

```typescript
// create-item-dialog.tsx 关键代码片段
const createMutation = useMutation({
  ...itemsCreateItemMutation(),
  onSuccess: () => {
    toast.success("Item created successfully")
    // 失效查询缓存，触发数据刷新
    queryClient.invalidateQueries({ 
      queryKey: itemsReadItemsQueryKey() 
    })
    setOpen(false)
    form.reset()
  },
  onError: (error: any) => {
    toast.error(`Failed to create item: ${error.message || "Unknown error"}`)
  },
})
```

#### 2. 读取功能 (Read)

**核心特性：**

- 使用 TanStack Query 进行数据获取和缓存
- 支持分页、排序、筛选
- 自动错误处理和加载状态

```typescript
// route.tsx 关键代码片段
const result = useQuery({
  ...getItemsQueryOptions({ page }),
  placeholderData: (prevData) => prevData,
})

// 在组件中使用
{result.isLoading ? (
  <div>Loading items...</div>
) : result.isError ? (
  <div>Error loading items: {result.error?.message}</div>
) : (
  <DataTable data={result.data?.data || []} />
)}
```

#### 3. 更新功能 (Update)

**核心特性：**

- 预填充现有数据
- 表单验证和错误处理
- 乐观更新用户界面

```typescript
// edit-item-dialog.tsx 关键代码片段
const updateMutation = useMutation({
  ...itemsUpdateItemMutation(),
  onSuccess: () => {
    toast.success("Item updated successfully")
    queryClient.invalidateQueries({ 
      queryKey: itemsReadItemsQueryKey() 
    })
    setOpen(false)
    form.reset()
  },
  onError: (error: any) => {
    toast.error(`Failed to update item: ${error.message || "Unknown error"}`)
  },
})
```

#### 4. 删除功能 (Delete)

**核心特性：**

- 安全的删除确认对话框
- 清晰的用户提示
- 防止误操作

```typescript
// delete-item-dialog.tsx 关键代码片段
const deleteMutation = useMutation({
  ...itemsDeleteItemMutation(),
  onSuccess: () => {
    toast.success("Item deleted successfully")
    queryClient.invalidateQueries({ 
      queryKey: itemsReadItemsQueryKey() 
    })
    setOpen(false)
  },
  onError: (error: any) => {
    toast.error(`Failed to delete item: ${error.message || "Unknown error"}`)
  },
})
```

### 🎯 最佳实践

#### 1. 统一的错误处理

```typescript
// 所有 mutation 都使用相同的错误处理模式
onError: (error: any) => {
  toast.error(`操作失败: ${error.message || "Unknown error"}`)
}
```

#### 2. 一致的加载状态

```typescript
// 统一的加载状态显示
{mutation.isPending ? (
  <>
    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
    Loading...
  </>
) : (
  "Button Text"
)}
```

#### 3. 智能缓存管理

```typescript
// 使用生成的查询键确保缓存一致性
queryClient.invalidateQueries({ 
  queryKey: itemsReadItemsQueryKey() 
})
```

#### 4. 类型安全的表单

```typescript
// 使用 Zod schema 确保类型安全
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(255, "Description too long").optional(),
})

type FormData = z.infer<typeof formSchema>
```

### 🔄 数据流图

```plaintext
用户操作 → 表单提交 → API调用 → 缓存更新 → UI刷新
    ↓           ↓         ↓        ↓         ↓
  点击按钮 → 验证数据 → 发送请求 → 失效缓存 → 显示最新数据
```

### 🛡️ 错误处理策略

1. **网络错误**：显示友好的错误消息
2. **验证错误**：实时表单验证反馈
3. **业务错误**：Toast 通知具体错误信息
4. **加载状态**：防止重复提交和用户混淆

### 📊 性能优化

1. **查询缓存**：避免重复的 API 请求
2. **乐观更新**：提升用户体验
3. **按需加载**：组件懒加载
4. **类型推断**：减少运行时错误

### 🎨 用户体验

1. **即时反馈**：Toast 通知操作结果
2. **防误操作**：删除确认对话框
3. **一致性**：统一的设计语言
4. **响应式**：适配不同屏幕尺寸

这个实现为现代 React 应用提供了一个完整的 CRUD 模板，可以轻松复制到其他实体的开发中。
