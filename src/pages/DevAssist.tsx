import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sparkles,
  Code,
  TestTube2,
  Globe,
  Rocket,
  GitBranch,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode2,
  Layers,
  Server,
  RefreshCw,
  ExternalLink,
  FolderOpen,
  Folder,
  File,
  X,
  Play,
  Square,
  Circle,
  Minus,
  Maximize2,
  Bot,
  Loader2,
  AlertCircle,
  Settings2,
  PanelBottomClose,
  PanelBottomOpen,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Mock File Tree ----
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

const mockFileTree: FileNode[] = [
  {
    name: 'app', type: 'folder', children: [
      {
        name: 'routers', type: 'folder', children: [
          { name: 'users.py', type: 'file', language: 'python' },
          { name: 'auth.py', type: 'file', language: 'python' },
          { name: '__init__.py', type: 'file', language: 'python' },
        ]
      },
      {
        name: 'models', type: 'folder', children: [
          { name: 'user.py', type: 'file', language: 'python' },
          { name: '__init__.py', type: 'file', language: 'python' },
        ]
      },
      {
        name: 'schemas', type: 'folder', children: [
          { name: 'user.py', type: 'file', language: 'python' },
        ]
      },
      { name: 'db.py', type: 'file', language: 'python' },
      { name: 'auth.py', type: 'file', language: 'python' },
      { name: 'main.py', type: 'file', language: 'python' },
    ]
  },
  {
    name: 'tests', type: 'folder', children: [
      {
        name: 'unit', type: 'folder', children: [
          { name: 'test_users.py', type: 'file', language: 'python' },
        ]
      },
      {
        name: 'integration', type: 'folder', children: [
          { name: 'test_user_flow.py', type: 'file', language: 'python' },
        ]
      },
      { name: 'conftest.py', type: 'file', language: 'python' },
    ]
  },
  { name: 'requirements.txt', type: 'file', language: 'text' },
  { name: 'Dockerfile', type: 'file', language: 'docker' },
  { name: '.env.example', type: 'file', language: 'env' },
];

// ---- Mock Code Files ----
const mockFiles: Record<string, { content: string; language: string }> = {
  'app/routers/users.py': {
    language: 'python',
    content: `from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """创建新用户"""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="邮箱已被注册"
        )
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户列表（需鉴权）"""
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """获取单个用户"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除用户"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    db.delete(user)
    db.commit()`,
  },
  'app/models/user.py': {
    language: 'python',
    content: `from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"`,
  },
  'app/schemas/user.py': {
    language: 'python',
    content: `from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True`,
  },
  'tests/unit/test_users.py': {
    language: 'python',
    content: `import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    response = await client.post("/users/", json={
        "email": "test@example.com",
        "name": "测试用户",
        "password": "SecurePass123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "测试用户"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_duplicate_user(client: AsyncClient):
    payload = {
        "email": "dup@example.com",
        "name": "重复用户",
        "password": "SecurePass123"
    }
    await client.post("/users/", json=payload)
    response = await client.post("/users/", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient):
    response = await client.get("/users/99999")
    assert response.status_code == 404`,
  },
  'app/main.py': {
    language: 'python',
    content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth
from app.db import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HoloPracticum API",
    version="0.1.0",
    description="AI-powered development platform API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok"}`,
  },
};

// ---- Mock API Design (Enhanced) ----
const mockApiDesign = [
  {
    method: 'POST', path: '/api/users/', desc: '创建用户', auth: false, status: '201',
    request: '{\n  "email": "string (EmailStr)",\n  "name": "string",\n  "password": "string (min 8)"\n}',
    response: '{\n  "id": "int",\n  "email": "string",\n  "name": "string",\n  "is_active": "bool",\n  "created_at": "datetime"\n}',
  },
  {
    method: 'GET', path: '/api/users/', desc: '获取用户列表', auth: true, status: '200',
    request: 'Query: skip=0&limit=20',
    response: '[\n  { "id", "email", "name", "is_active", "created_at" }\n]',
  },
  {
    method: 'GET', path: '/api/users/{id}', desc: '获取单个用户', auth: false, status: '200',
    request: 'Path: user_id (int)',
    response: '{\n  "id", "email", "name", "is_active",\n  "created_at", "updated_at"\n}',
  },
  {
    method: 'PUT', path: '/api/users/{id}', desc: '更新用户信息', auth: true, status: '200',
    request: '{\n  "name?": "string",\n  "email?": "EmailStr",\n  "is_active?": "bool"\n}',
    response: '同 GET /api/users/{id}',
  },
  {
    method: 'DELETE', path: '/api/users/{id}', desc: '删除用户', auth: true, status: '204',
    request: 'Path: user_id (int)',
    response: 'No Content',
  },
];

// ---- Mock Task Breakdown (Planner) ----
const mockTaskBreakdown = [
  {
    id: 'tb1',
    category: '数据模型',
    icon: 'database',
    status: 'done' as const,
    tasks: [
      { title: 'User 表设计 (id, email, name, hashed_password, is_active, timestamps)', done: true },
      { title: '添加 email 唯一索引', done: true },
      { title: 'SQLAlchemy ORM Model 定义', done: true },
    ],
  },
  {
    id: 'tb2',
    category: 'API 设计',
    icon: 'globe',
    status: 'done' as const,
    tasks: [
      { title: 'CRUD 端点: POST / GET / GET:id / PUT / DELETE', done: true },
      { title: 'Pydantic Request/Response Schema', done: true },
      { title: 'JWT 鉴权中间件 (protected routes)', done: true },
      { title: '分页参数 skip/limit', done: true },
    ],
  },
  {
    id: 'tb3',
    category: '前端页面',
    icon: 'layout',
    status: 'planned' as const,
    tasks: [
      { title: '用户列表页 (Table + Pagination)', done: false },
      { title: '用户详情/编辑 Modal', done: false },
      { title: '注册/登录表单页', done: false },
      { title: 'API Client (axios/fetch wrapper)', done: false },
    ],
  },
  {
    id: 'tb4',
    category: '测试建议',
    icon: 'test',
    status: 'done' as const,
    tasks: [
      { title: '单元测试: CRUD 各端点正常路径', done: true },
      { title: '边界测试: 重复邮箱 / 空字段 / 超长输入', done: true },
      { title: '集成测试: 完整 CRUD 流程', done: true },
    ],
  },
  {
    id: 'tb5',
    category: '部署建议',
    icon: 'rocket',
    status: 'planned' as const,
    tasks: [
      { title: 'Dockerfile + docker-compose.yml', done: false },
      { title: 'CI Pipeline: lint → test → build → deploy', done: false },
      { title: '环境变量管理 (.env + secrets)', done: false },
    ],
  },
];

// ---- Mock Test Suggestions (Enhanced) ----
const mockTestSuggestions = [
  {
    id: 'ts1',
    category: '单元测试',
    cases: [
      { title: '创建用户 — 正常输入', code: 'POST /users/ → 201, 返回 user 对象含 id', status: 'pass' as const },
      { title: '获取用户列表 — 带分页', code: 'GET /users/?skip=0&limit=10 → 200, 返回数组', status: 'pass' as const },
      { title: '获取单个用户 — 存在', code: 'GET /users/1 → 200, 返回正确用户', status: 'pass' as const },
      { title: '更新用户 — 部分字段', code: 'PUT /users/1 {name: "新名"} → 200, name 已更新', status: 'pass' as const },
      { title: '删除用户 — 正常删除', code: 'DELETE /users/1 → 204, 再次 GET → 404', status: 'pass' as const },
    ],
  },
  {
    id: 'ts2',
    category: '边界情况',
    cases: [
      { title: '重复邮箱注册', code: 'POST /users/ 相同 email × 2 → 第二次 409 Conflict', status: 'pass' as const },
      { title: '邮箱格式非法', code: 'POST /users/ email="not-email" → 422 Validation Error', status: 'pass' as const },
      { title: '密码过短', code: 'POST /users/ password="123" → 422, detail: min 8 chars', status: 'warn' as const },
      { title: '空 name 字段', code: 'POST /users/ name="" → 422 Validation Error', status: 'pass' as const },
      { title: '超长字符串 (>255)', code: 'POST /users/ name="a"*500 → 422 或数据库截断', status: 'warn' as const },
      { title: 'skip/limit 负数', code: 'GET /users/?skip=-1&limit=0 → 422 Validation', status: 'pass' as const },
    ],
  },
  {
    id: 'ts3',
    category: '异常处理',
    cases: [
      { title: '用户不存在 — GET', code: 'GET /users/99999 → 404, detail: "用户不存在"', status: 'pass' as const },
      { title: '用户不存在 — PUT', code: 'PUT /users/99999 → 404', status: 'pass' as const },
      { title: '用户不存在 — DELETE', code: 'DELETE /users/99999 → 404', status: 'pass' as const },
      { title: '未鉴权访问保护端点', code: 'GET /users/ 无 Token → 401 Unauthorized', status: 'pass' as const },
      { title: 'Token 过期', code: 'GET /users/ 过期 Token → 401, detail: "Token expired"', status: 'warn' as const },
      { title: '数据库连接失败', code: '任意请求 → 500, detail: "Database unavailable"', status: 'warn' as const },
    ],
  },
];

// ---- Mock Directory Structure ----
const mockDirStructure = `project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── db.py                # 数据库连接 & Session
│   ├── auth.py              # JWT 鉴权逻辑
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py          # SQLAlchemy User Model
│   ├── schemas/
│   │   └── user.py          # Pydantic Request/Response
│   └── routers/
│       ├── __init__.py
│       ├── users.py          # 用户 CRUD 路由
│       └── auth.py           # 登录/注册路由
├── tests/
│   ├── conftest.py           # 测试 fixtures
│   ├── unit/
│   │   └── test_users.py     # 用户接口单元测试
│   └── integration/
│       └── test_user_flow.py # 端到端集成测试
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example`;

// ---- Mock Terminal Logs ----
const mockTerminalLogs = [
  { time: '09:32:01', type: 'info', text: '$ holopracticum generate --type api' },
  { time: '09:32:01', type: 'agent', text: '[Planner] 分析需求描述...识别到 CRUD 模式 + JWT 鉴权' },
  { time: '09:32:02', type: 'agent', text: '[Planner] 拆解子任务: model → schema → router → test → ci' },
  { time: '09:32:03', type: 'agent', text: '[Executor] 生成 app/models/user.py (20 行)' },
  { time: '09:32:04', type: 'agent', text: '[Executor] 生成 app/schemas/user.py (28 行)' },
  { time: '09:32:05', type: 'agent', text: '[Executor] 生成 app/routers/users.py (72 行)' },
  { time: '09:32:06', type: 'agent', text: '[Executor] 生成 tests/unit/test_users.py (38 行)' },
  { time: '09:32:07', type: 'success', text: '[Validator] 代码质量检查通过 ✓ 类型安全 ✓ 无 SQL 注入风险' },
  { time: '09:32:07', type: 'success', text: '[Validator] API 设计规范 ✓ RESTful 一致性 ✓ 状态码正确' },
  { time: '09:32:08', type: 'info', text: '生成完成: 5 files, 158 lines, 耗时 7.2s' },
];

// ---- Mock CI/CD Steps ----
const mockCICDSteps = [
  { stage: 'Lint & Format', cmd: 'ruff check . && black --check .', status: 'success' as const },
  { stage: 'Unit Tests', cmd: 'pytest tests/unit -v --cov=app', status: 'success' as const },
  { stage: 'Integration Tests', cmd: 'pytest tests/integration -v', status: 'success' as const },
  { stage: 'Build Image', cmd: 'docker build -t app:latest .', status: 'pending' as const },
  { stage: 'Deploy Staging', cmd: 'kubectl apply -f k8s/staging/', status: 'pending' as const },
];

const methodColors: Record<string, string> = {
  GET: 'text-status-success',
  POST: 'text-primary',
  PUT: 'text-status-warning',
  DELETE: 'text-status-error',
};

const methodBgColors: Record<string, string> = {
  GET: 'bg-status-success/10',
  POST: 'bg-primary/10',
  PUT: 'bg-status-warning/10',
  DELETE: 'bg-status-error/10',
};

const techStacks = [
  { value: 'fastapi', label: 'FastAPI', group: '后端' },
  { value: 'flask', label: 'Flask', group: '后端' },
  { value: 'express', label: 'Express.js', group: '后端' },
  { value: 'react', label: 'React', group: '前端' },
  { value: 'vue', label: 'Vue.js', group: '前端' },
  { value: 'next', label: 'Next.js', group: '前端' },
  { value: 'postgres', label: 'PostgreSQL', group: '数据库' },
  { value: 'mysql', label: 'MySQL', group: '数据库' },
  { value: 'mongo', label: 'MongoDB', group: '数据库' },
];

type ViewState = 'input' | 'generating' | 'result';
type BottomTab = 'terminal' | 'tasks' | 'api' | 'tests' | 'cicd' | 'git';

// ---- AI Plan Types ----
interface AiPlan {
  workspace_name: string;
  summary: string;
  plan: { category: string; status: 'done' | 'planned'; tasks: { title: string; done: boolean }[] }[];
  files: { path: string; language: string; content: string }[];
  apis: { method: string; path: string; desc: string; auth: boolean; status: string; request: string; response: string }[];
  tests: { category: string; cases: { title: string; code: string; status: 'pass' | 'warn' }[] }[];
  dir_structure: string;
  cicd: { stage: string; cmd: string; status: 'success' | 'pending' }[];
  validator_notes: string[];
}

// Build a file tree from a flat list of file paths
function buildFileTree(files: { path: string; language: string }[]): FileNode[] {
  const root: FileNode[] = [];
  for (const f of files) {
    const parts = f.path.split('/').filter(Boolean);
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const isLeaf = i === parts.length - 1;
      const name = parts[i];
      let node = cur.find((n) => n.name === name && n.type === (isLeaf ? 'file' : 'folder'));
      if (!node) {
        node = isLeaf
          ? { name, type: 'file', language: f.language }
          : { name, type: 'folder', children: [] };
        cur.push(node);
      }
      if (!isLeaf) cur = node.children!;
    }
  }
  return root;
}

// ---- File Tree Component ----
function FileTreeItem({
  node,
  depth = 0,
  activeFile,
  onSelect,
  resolvePath,
}: {
  node: FileNode;
  depth?: number;
  activeFile: string;
  onSelect: (path: string) => void;
  resolvePath: (name: string) => string | null;
}) {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1 px-2 py-[3px] text-[11px] hover:bg-accent/50 transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {open ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
          )}
          {open ? (
            <FolderOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children?.map((child, i) => (
          <FileTreeItem
            key={i}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onSelect={onSelect}
            resolvePath={resolvePath}
          />
        ))}
      </div>
    );
  }

  // Determine file icon color by extension
  const ext = node.name.split('.').pop();
  const iconColor = ext === 'py' ? 'text-status-warning' : 'text-muted-foreground';

  return (
    <button
      onClick={() => {
        const match = resolvePath(node.name);
        if (match) onSelect(match);
      }}
      className={cn(
        'w-full flex items-center gap-1.5 px-2 py-[3px] text-[11px] transition-colors',
        activeFile.endsWith(node.name)
          ? 'bg-accent text-foreground'
          : 'hover:bg-accent/50 text-muted-foreground'
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <File className={cn('w-3 h-3 shrink-0', iconColor)} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ---- Code with Line Numbers ----
function CodeEditor({ code, language }: { code: string; language: string }) {
  const lines = code.split('\n');
  return (
    <div className="flex text-[12px] font-mono leading-[20px] overflow-auto h-full">
      {/* Line numbers */}
      <div className="sticky left-0 bg-card select-none text-muted-foreground/40 text-right pr-4 pl-4 border-r border-border shrink-0">
        {lines.map((_, i) => (
          <div key={i} className="h-[20px]">{i + 1}</div>
        ))}
      </div>
      {/* Code content */}
      <pre className="pl-4 pr-6 py-0 flex-1 min-w-0">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="h-[20px] hover:bg-accent/30 transition-colors whitespace-pre">
              {line || '\u00A0'}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ---- Main Component ----
export default function DevAssist() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [requirement, setRequirement] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>(['fastapi', 'postgres']);
  const [activeFile, setActiveFile] = useState('app/routers/users.py');
  const [openTabs, setOpenTabs] = useState<string[]>(['app/routers/users.py']);
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');
  const [showBottom, setShowBottom] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const termRef = useRef<HTMLDivElement>(null);
  const [visibleLogs, setVisibleLogs] = useState<{ time: string; type: string; text: string }[]>([]);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active dataset: prefer AI plan, fall back to mock so the UI is always populated
  const filesMap: Record<string, { content: string; language: string }> = aiPlan
    ? Object.fromEntries(aiPlan.files.map((f) => [f.path, { content: f.content, language: f.language }]))
    : mockFiles;
  const fileTree: FileNode[] = aiPlan ? buildFileTree(aiPlan.files) : mockFileTree;
  const planGroups = aiPlan
    ? aiPlan.plan.map((g, i) => ({ id: `p${i}`, category: g.category, status: g.status, tasks: g.tasks }))
    : mockTaskBreakdown;
  const apis = aiPlan ? aiPlan.apis : mockApiDesign;
  const tests = aiPlan
    ? aiPlan.tests.map((g, i) => ({ id: `t${i}`, category: g.category, cases: g.cases }))
    : mockTestSuggestions;
  const dirStructure = aiPlan ? aiPlan.dir_structure : mockDirStructure;
  const cicd = aiPlan ? aiPlan.cicd : mockCICDSteps;
  const validatorNotes = aiPlan ? aiPlan.validator_notes : [];
  const workspaceName = aiPlan ? aiPlan.workspace_name : 'user-management';

  const resolvePath = (name: string) => {
    const keys = Object.keys(filesMap);
    return keys.find((k) => k.endsWith(name)) || null;
  };

  const toggleStack = (value: string) => {
    setSelectedStacks((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const pushLog = (log: { time: string; type: string; text: string }) => {
    setVisibleLogs((prev) => [...prev, log]);
  };

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    setViewState('generating');
    setVisibleLogs([]);
    setAiError(null);
    setAiPlan(null);

    const t = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });
    pushLog({ time: t(), type: 'info', text: '$ holopracticum generate --type api' });
    pushLog({ time: t(), type: 'agent', text: '[Planner] 分析需求描述，准备拆解子任务...' });

    // Heartbeat while AI is running so the terminal feels alive
    const beats = [
      { delay: 1200, type: 'agent', text: '[Planner] 识别模块边界与依赖关系...' },
      { delay: 2800, type: 'agent', text: '[Executor] 起草数据模型与接口签名...' },
      { delay: 5000, type: 'agent', text: '[Executor] 生成路由与测试代码...' },
      { delay: 8000, type: 'agent', text: '[Validator] 评审代码质量与安全风险...' },
    ];
    const timers = beats.map((b) =>
      setTimeout(() => pushLog({ time: t(), type: b.type, text: b.text }), b.delay)
    );

    try {
      const { data, error } = await supabase.functions.invoke('generate-dev-plan', {
        body: { requirement, stacks: selectedStacks },
      });
      timers.forEach(clearTimeout);
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const plan: AiPlan = data.plan;
      if (!plan?.files?.length) throw new Error('AI 未生成任何文件');

      setAiPlan(plan);
      // Default open first file
      const first = plan.files[0].path;
      setActiveFile(first);
      setOpenTabs([first]);

      pushLog({ time: t(), type: 'success', text: `[Validator] 通过 ✓ ${plan.validator_notes?.[0] || '代码符合规范'}` });
      pushLog({
        time: t(),
        type: 'info',
        text: `生成完成: ${plan.files.length} files, ${plan.files.reduce((a, f) => a + f.content.split('\n').length, 0)} lines, ${plan.apis.length} APIs`,
      });
      setTimeout(() => setViewState('result'), 500);
      toast.success('开发方案已生成');
    } catch (e: any) {
      timers.forEach(clearTimeout);
      const msg = e?.message || '生成失败';
      setAiError(msg);
      pushLog({ time: t(), type: 'error', text: `[Error] ${msg}` });
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const handleReset = () => {
    setViewState('input');
    setRequirement('');
    setVisibleLogs([]);
    setActiveFile('app/routers/users.py');
    setOpenTabs(['app/routers/users.py']);
  };

  const openFile = (path: string) => {
    setActiveFile(path);
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(newTabs);
    if (activeFile === path) {
      setActiveFile(newTabs[newTabs.length - 1] || '');
    }
  };

  const copyCode = () => {
    const file = filesMap[activeFile];
    if (file) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentFile = filesMap[activeFile];
  const fileName = activeFile.split('/').pop() || '';

  return (
    <div className="space-y-4">
      {/* Header - IDE style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Code className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">AI 开发协作台</h1>
            <p className="text-[11px] text-muted-foreground">
              {viewState === 'result'
                ? `workspace: ${workspaceName} · ${Object.keys(filesMap).length} files · ${selectedStacks.join(' + ') || 'AI 选型'}`
                : '输入需求描述，AI 生成完整开发方案'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {viewState === 'result' && (
            <>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                新需求
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <GitBranch className="w-3 h-3" />
                提交 PR
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input State */}
      {viewState === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Requirement Input - terminal style */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-status-error/60" />
                  <span className="w-3 h-3 rounded-full bg-status-warning/60" />
                  <span className="w-3 h-3 rounded-full bg-status-success/60" />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono ml-2">需求输入 — HoloPracticum Agent</span>
              </div>
              <div className="p-4 space-y-3">
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder={'// 描述你的开发需求\n// 例如：\n\n实现一个用户管理模块，包含注册、登录、CRUD 接口。\n使用 FastAPI + PostgreSQL，需要 JWT 鉴权，\n密码加密存储，邮箱唯一约束。\n请同时给出 Pydantic Schema 和 SQLAlchemy Model。'}
                  className="w-full min-h-[180px] bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50 font-mono leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Planner → Executor → Validator
                  </span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!requirement.trim()}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
                    requirement.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Play className="w-3 h-3" />
                  Run Generate
                  <kbd className="hidden sm:inline-flex px-1 py-0.5 rounded bg-primary-foreground/20 text-[9px] font-mono">
                    ⌘↵
                  </kbd>
                </button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { title: '用户管理 CRUD', desc: '注册、登录、JWT 鉴权、密码加密' },
                { title: '文件上传服务', desc: 'MinIO 存储、断点续传、权限控制' },
                { title: 'WebSocket 通知', desc: '实时推送、已读状态、消息队列' },
                { title: 'RBAC 权限系统', desc: '角色管理、权限树、资源关联' },
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setRequirement(`${p.title}：${p.desc}`)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
                >
                  <p className="text-xs font-medium group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Tech Stack */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Layers className="w-3.5 h-3.5 text-primary" />
                技术栈
              </div>
              {['后端', '前端', '数据库'].map((group) => (
                <div key={group} className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {techStacks
                      .filter((s) => s.group === group)
                      .map((stack) => (
                        <button
                          key={stack.value}
                          onClick={() => toggleStack(stack.value)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] transition-colors border',
                            selectedStacks.includes(stack.value)
                              ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                              : 'border-border text-muted-foreground hover:bg-accent'
                          )}
                        >
                          {stack.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Git Placeholder */}
            <div className="bg-card border border-dashed border-border rounded-lg p-4 space-y-2 opacity-50">
              <div className="flex items-center gap-2 text-xs font-medium">
                <GitBranch className="w-3.5 h-3.5" />
                Git 仓库
              </div>
              <p className="text-[10px] text-muted-foreground">连接 GitHub / GitLab 后可直接提交 PR</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ExternalLink className="w-3 h-3" /> 即将支持
              </div>
            </div>

            {/* Jenkins Placeholder */}
            <div className="bg-card border border-dashed border-border rounded-lg p-4 space-y-2 opacity-50">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Server className="w-3.5 h-3.5" />
                Jenkins / K8s
              </div>
              <p className="text-[10px] text-muted-foreground">对接 CI/CD 实现一键部署</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ExternalLink className="w-3 h-3" /> 即将支持
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generating State - Terminal Style */}
      {viewState === 'generating' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-status-error/60" />
              <span className="w-3 h-3 rounded-full bg-status-warning/60" />
              <span className="w-3 h-3 rounded-full bg-status-success/60" />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono ml-2">
              <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
              Agent 执行中...
            </span>
          </div>
          <div ref={termRef} className="p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto bg-background">
            {visibleLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 animate-fade-in">
                <span className="text-muted-foreground/50 shrink-0 w-16">{log.time}</span>
                <span
                  className={cn(
                    log.type === 'agent' && 'text-primary',
                    log.type === 'success' && 'text-status-success',
                    log.type === 'info' && 'text-muted-foreground'
                  )}
                >
                  {log.text}
                </span>
              </div>
            ))}
            {visibleLogs.length < 999 && (
              <div className="flex items-center gap-1 text-muted-foreground/50">
                <span className="animate-pulse">▊</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result State - IDE Layout */}
      {viewState === 'result' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          {/* IDE Body */}
          <div className="flex flex-1 min-h-0">
            {/* File Explorer */}
            {showExplorer && (
              <div className="w-52 border-r border-border bg-muted/20 flex flex-col shrink-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    资源管理器
                  </span>
                  <button onClick={() => setShowExplorer(false)} className="text-muted-foreground hover:text-foreground">
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-1">
                  {fileTree.map((node, i) => (
                    <FileTreeItem
                      key={i}
                      node={node}
                      activeFile={activeFile}
                      onSelect={openFile}
                      resolvePath={resolvePath}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Tab Bar */}
              <div className="flex items-center border-b border-border bg-muted/20 overflow-x-auto">
                {!showExplorer && (
                  <button
                    onClick={() => setShowExplorer(true)}
                    className="px-2 py-2 text-muted-foreground hover:text-foreground border-r border-border shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                )}
                {openTabs.map((tab) => {
                  const tabName = tab.split('/').pop() || tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFile(tab)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-[11px] border-r border-border shrink-0 transition-colors',
                        activeFile === tab
                          ? 'bg-card text-foreground border-b-2 border-b-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      )}
                    >
                      <FileCode2 className="w-3 h-3 text-status-warning" />
                      {tabName}
                      <button
                        onClick={(e) => closeTab(tab, e)}
                        className="ml-1 hover:bg-accent rounded p-0.5 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </button>
                  );
                })}
                <div className="flex-1" />
                <div className="flex items-center gap-1 px-2 shrink-0">
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              {/* Breadcrumb */}
              {currentFile && (
                <div className="flex items-center gap-1 px-4 py-1.5 text-[10px] text-muted-foreground border-b border-border bg-muted/10">
                  {activeFile.split('/').map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="w-2.5 h-2.5" />}
                      <span className={i === arr.length - 1 ? 'text-foreground' : ''}>{part}</span>
                    </span>
                  ))}
                  <span className="ml-2 text-muted-foreground/40">— {currentFile.language}</span>
                </div>
              )}

              {/* Code Area */}
              <div className="flex-1 overflow-auto">
                {currentFile ? (
                  <CodeEditor code={currentFile.content} language={currentFile.language} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    选择一个文件查看代码
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className={cn('border-t border-border flex flex-col', showBottom ? 'h-72' : 'h-8')}>
            {/* Bottom Tab Bar */}
            <div className="flex items-center justify-between px-1 bg-muted/20 border-b border-border shrink-0">
              <div className="flex items-center overflow-x-auto">
                {(
                  [
                    { key: 'terminal' as BottomTab, label: '终端', icon: Terminal },
                    { key: 'tasks' as BottomTab, label: '任务拆解', icon: Layers },
                    { key: 'api' as BottomTab, label: 'API 设计', icon: Globe },
                    { key: 'tests' as BottomTab, label: '测试建议', icon: TestTube2 },
                    { key: 'cicd' as BottomTab, label: 'CI/CD', icon: Rocket },
                    { key: 'git' as BottomTab, label: 'Git', icon: GitBranch },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setBottomTab(tab.key);
                      setShowBottom(true);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-[11px] transition-colors whitespace-nowrap',
                      bottomTab === tab.key && showBottom
                        ? 'text-foreground border-b-2 border-b-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                    {tab.key === 'tests' && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-status-warning/10 text-status-warning">3</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowBottom(!showBottom)}
                className="px-2 py-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                {showBottom ? <PanelBottomClose className="w-3.5 h-3.5" /> : <PanelBottomOpen className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Bottom Content */}
            {showBottom && (
              <div className="flex-1 overflow-auto bg-background">
                {/* Terminal */}
                {bottomTab === 'terminal' && (
                  <div className="p-3 font-mono text-[11px] space-y-0.5">
                    {visibleLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground/40 shrink-0 w-14">{log.time}</span>
                        <span
                          className={cn(
                            log.type === 'agent' && 'text-primary',
                            log.type === 'success' && 'text-status-success',
                            log.type === 'info' && 'text-muted-foreground'
                          )}
                        >
                          {log.text}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 text-muted-foreground/50 mt-1">
                      <span>$</span>
                      <span className="animate-pulse">▊</span>
                    </div>
                  </div>
                )}

                {/* Task Breakdown (Planner) */}
                {bottomTab === 'tasks' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      <span>Planner Agent 已拆解为 5 个模块，共 {planGroups.reduce((a, b) => a + b.tasks.length, 0)} 个子任务</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {planGroups.map((group) => (
                        <div key={group.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-medium">{group.category}</p>
                            <span className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded-full',
                              group.status === 'done'
                                ? 'bg-status-success/10 text-status-success'
                                : 'bg-secondary text-muted-foreground'
                            )}>
                              {group.status === 'done' ? '已完成' : '待开发'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {group.tasks.map((task, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-[10px]">
                                {task.done ? (
                                  <CheckCircle2 className="w-3 h-3 text-status-success shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-0.5" />
                                )}
                                <span className={task.done ? 'text-muted-foreground' : 'text-foreground'}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Directory Structure */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
                        <span className="text-[11px] font-medium flex items-center gap-1.5">
                          <FolderOpen className="w-3 h-3 text-primary" /> 项目目录结构
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(dirStructure)}
                          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> 复制
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-muted-foreground leading-relaxed overflow-auto">
                        {dirStructure}
                      </pre>
                    </div>
                  </div>
                )}

                {/* API Design (Enhanced) */}
                {bottomTab === 'api' && (
                  <div className="p-4 space-y-3">
                    {apis.map((api, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-mono font-bold',
                            methodColors[api.method], methodBgColors[api.method]
                          )}>
                            {api.method}
                          </span>
                          <code className="text-[12px] font-mono font-medium flex-1">{api.path}</code>
                          <span className="text-[10px] text-muted-foreground">{api.desc}</span>
                          {api.auth && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-status-warning/10 text-status-warning">需鉴权</span>
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground">{api.status}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border">
                          <div className="p-3">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Request</p>
                            <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap">{api.request}</pre>
                          </div>
                          <div className="p-3">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Response</p>
                            <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap">{api.response}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Test Suggestions (Enhanced) */}
                {bottomTab === 'tests' && (
                  <div className="p-4 space-y-4">
                    {tests.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <p className="text-[11px] font-medium flex items-center gap-2">
                          <TestTube2 className="w-3.5 h-3.5 text-primary" />
                          {group.category}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {group.cases.length} cases
                          </span>
                        </p>
                        <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
                          {group.cases.map((tc, j) => (
                            <div key={j} className="flex items-center gap-3 px-3 py-2 hover:bg-accent/30 transition-colors">
                              <div className="shrink-0">
                                {tc.status === 'pass' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-status-warning" />
                                )}
                              </div>
                              <span className="text-[11px] font-medium w-40 shrink-0">{tc.title}</span>
                              <code className="text-[10px] font-mono text-muted-foreground flex-1 truncate">
                                {tc.code}
                              </code>
                              <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded shrink-0',
                                tc.status === 'pass'
                                  ? 'bg-status-success/10 text-status-success'
                                  : 'bg-status-warning/10 text-status-warning'
                              )}>
                                {tc.status === 'pass' ? 'PASS' : 'WARN'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                      <CheckCircle2 className="w-3 h-3 text-status-success" />
                      {tests.flatMap(g => g.cases).filter(c => c.status === 'pass').length} passed
                      <span className="mx-1">·</span>
                      <AlertCircle className="w-3 h-3 text-status-warning" />
                      {tests.flatMap(g => g.cases).filter(c => c.status === 'warn').length} warnings (建议补充处理)
                    </div>
                  </div>
                )}

                {/* CI/CD */}
                {bottomTab === 'cicd' && (
                  <div className="p-3 space-y-2">
                    {cicd.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px]">
                        <div className="w-5 flex justify-center">
                          {step.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-status-success" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/30" />
                          )}
                        </div>
                        <span className="font-medium w-36">{step.stage}</span>
                        <code className="font-mono text-muted-foreground flex-1">{step.cmd}</code>
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded',
                            step.status === 'success'
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-secondary text-muted-foreground'
                          )}
                        >
                          {step.status === 'success' ? 'PASS' : 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Git */}
                {bottomTab === 'git' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4 text-[11px]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span className="font-mono">feature/user-management</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success">
                        +{Object.values(filesMap).reduce((a, f) => a + f.content.split('\n').length, 0)} lines
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {Object.keys(filesMap).length} files changed
                      </span>
                    </div>
                    <div className="space-y-1">
                      {Object.keys(filesMap).map((path) => (
                        <div key={path} className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-status-success">A</span>
                          <button
                            onClick={() => openFile(path)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {path}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <GitBranch className="w-3 h-3" />
                        Create Pull Request
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] border border-border text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Connect Repository
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-primary text-primary-foreground text-[10px] shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> feature/user-management
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 0 errors
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 0 warnings
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>Python</span>
              <span>UTF-8</span>
              <span>LF</span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" /> Agent: Idle
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
