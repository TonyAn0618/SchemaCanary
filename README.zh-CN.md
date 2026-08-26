# SchemaCanary

[![CI](https://github.com/TonyAn0618/SchemaCanary/actions/workflows/ci.yml/badge.svg)](https://github.com/TonyAn0618/SchemaCanary/actions/workflows/ci.yml)

[English](README.md)

发现、缩减并持续跟踪不同 LLM provider 对 JSON Schema 的兼容性问题。

SchemaCanary 面向正在使用结构化输出、tool calling、Agent 或 Schema 数据抽取的开发者。
目标是用完全相同的契约测试不同 provider，并把大型失败 Schema 变成可复现的小案例。

> **当前为 pre-alpha：**尚未实现真实 provider 请求和自动缩减。现有命令只做离线 JSON
> Schema 检查，npm 包也尚未发布。

## 当前可用功能

```bash
pnpm install
pnpm build
node dist/cli.js inspect examples/order.schema.json
```

`inspect` 不发起网络请求。它会检查严格 UTF-8 与 JSON、重复键和 JSON Schema 2020-12
元模式合法性，并生成稳定 SHA-256 标识及 terminal、JSON 或 Markdown 报告。

机器可读输出：

```bash
node dist/cli.js inspect examples/order.schema.json --format json
```

检查通过只代表 Schema 自身合法，不代表任何 LLM provider 一定接受，也不代表模型输出
在语义上正确。完整参数和退出码见 [CLI 契约](docs/CLI_SPEC.md)。

## 项目方向

1. **Discover**：通过真实请求发现并分类失败。
2. **Minimize**：保留同类失败，同时自动缩小 Schema。
3. **Track**：持续回归保存的案例，发现 provider 行为变化。

当前范围与技术决定见 [`docs/PROJECT.md`](docs/PROJECT.md)。贡献前请阅读
[贡献指南](.github/CONTRIBUTING.md)。问题和想法发到
[Discussions](https://github.com/TonyAn0618/SchemaCanary/discussions)，可复现问题发到
[Issues](https://github.com/TonyAn0618/SchemaCanary/issues)，漏洞使用
[私密安全报告](https://github.com/TonyAn0618/SchemaCanary/security/advisories/new)。
