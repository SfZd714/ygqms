# 千言·AI智能助手后端系统

## 基本信息

| 字段   | 内容                                                                       |
| ---- | ------------------------------------------------------------------------ |
| 项目名称 | 基于 LangChain4j 的企业级 AI Agent 智能助手后端系统                                    |
| 项目性质 | 个人开发练习项目                                                                 |
| 项目时间 | 2025年2月—2025年8月 |
| 团队规模 | 个人开发 |
| 个人角色 | 独立完成后端开发与相关工程实践，具体职责见下文 |
| 原始资料 | [相关私有链接已隐藏] |

## 项目定位

项目时间为 2025年2月—2025年8月，属于个人开发练习项目，非企业生产项目。基于 Spring Boot 3 与 LangChain4j 开发 Java 原生 AI Agent 后端系统，不依赖 Python 推理服务，RAG、Agent、工具调用与安全校验等主要业务逻辑在 Java 服务内部完成，对外提供 REST 与 SSE 接口供独立部署的前端调用。
## 技术栈

- **Java 后端**：Java 17、Spring Boot 3、Spring MVC、Spring Data Redis、Spring Data JPA、Maven
- **AI Agent**：LangChain4j、阿里云百炼模型服务、Function Calling、Agent Skill、InputGuardrail、MCP Java Client
- **数据存储**：Redis、ParadeDB（PostgreSQL）、pgvector、pg_search、本地 Markdown 文件
- **检索评测**：向量检索、BM25、RRF、Rerank、RAGAS 评测接口
- **监控部署**：Spring Boot Actuator、Micrometer、Prometheus、Grafana、Docker

## 系统分层

1. **Controller 接口层**：接收 HTTP 请求，对外提供 REST 与 SSE 流式接口。
2. **Service 业务层**：组织 Agent、RAG、知识库与会话业务。
3. **AI 核心层**：负责大模型调用、聊天记忆、工具调用、Skill 与护轨校验。
4. **存储层**：Redis 保存会话记忆，ParadeDB 保存向量、文档元数据与切块，本地 Markdown 保存知识原文。
5. **监控层**：通过 Actuator 与 Micrometer 采集调用、耗时、Token 与错误指标。

## 核心功能

### RAG 检索

- 按 Markdown 三级标题切分文档；
- 使用稠密向量检索与 BM25 稀疏检索召回候选；
- 使用 RRF 融合两路检索结果，再通过 Rerank 模型精排；
- 支持知识查重、冲突检测，以及本地 Markdown 与向量库双写。

### Agent 与工具调用

- 对接对话模型、Embedding 模型和 Rerank 模型；
- 支持时间、邮件、知识库等自定义 Tool；
- 通过 MCP Java Client 接入外部联网搜索；
- 将业务 SOP 封装为 Agent Skill，采用触发后加载完整内容的渐进式披露方式。

### 会话、安全与监控

- 基于 Redis 保存用户对话历史并设置 TTL，通过 `@MemoryId` 隔离不同会话；
- 支持普通 JSON 响应与 SSE 流式输出；
- 通过 InputGuardrail 校验输入，使用全局异常处理器和统一响应体处理异常；
- 采集大模型调用次数、Token 消耗、响应耗时与错误等指标，供 Prometheus/Grafana 展示；
- 提供 RAGAS 自动化评测接口，用于评估和迭代 RAG 效果。

## 简历口径

### 项目介绍

基于 Spring Boot 3 与 LangChain4j 开发 Java 原生企业级 AI Agent 后端，为独立前端提供 REST 与 SSE 接口。系统集成 Redis 会话持久化、ParadeDB 文档与向量存储，并通过向量检索、BM25、RRF 融合和 Rerank 精排构建 RAG 问答链路，同时支持工具调用、MCP 外部服务接入、安全校验、监控指标采集及 Docker 容器化部署。

### 个人职责

作为个人开发练习项目，独立完成 Java 后端工程搭建及核心功能开发，主要实现 LangChain4j 与模型服务接入、文档切分和混合检索链路、Redis 多会话记忆、REST/SSE 接口以及 Tool、MCP 和安全校验功能；同时完成统一异常处理、监控指标、RAG 评测接口与 Docker 配置等工程实践。项目未声称已在企业生产环境长期运行。

## 事实边界

- 项目为个人开发练习项目，时间为 2025年2月—2025年8月。
- 项目为 Java 原生后端实现，前端独立部署，后端不负责页面渲染。
- “个人职责”按用户确认的实际参与内容归纳；由于项目为个人开发，允许使用“独立完成/实现”描述本人实际编码内容，但不声称已在企业生产环境长期运行。
- Docker 容器化方案不自动等同于已在生产环境长期运行；生产部署状态待补充。
- 当前不把 Kafka、RocketMQ、Spring Cloud、Kubernetes、高并发生产经验写入项目技术栈。
- 代码仓库地址和可验证性能数据均待补充。

## 待补充证据

- [ ] 项目起止时间
- [ ] 团队规模与明确分工
- [ ] 本地或远程代码仓库路径
- [ ] 接口文档或 Apifox 导出文件
- [ ] Docker 运行截图或部署记录
- [ ] Prometheus/Grafana 指标截图
- [ ] RAGAS 测试集、指标与优化前后对比
- [ ] 数据库表结构及关键接口清单

## 关联页面

- 项目经历
- 技能栈
- 自我介绍与核心竞争力
- [[高频问答库]]
- [[AI应用开发岗位STAR故事库]]
- 工作与实习经历
- [[科研院所面试专项]]
- index
