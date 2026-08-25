# SchemaCanary

SchemaCanary 是一个处于早期阶段的开源 CLI，用于发现、缩减和持续跟踪不同 LLM
provider 对 JSON Schema / Structured Outputs 的兼容性问题。

它最终要解决的是：同一份 Schema 在 OpenAI、Claude、Gemini 等模型或 API 入口上可能
表现不同；大型 Schema 失败后，开发者又很难找到真正触发错误的最小结构。

项目围绕三个核心能力设计：

- **Discover**：通过真实请求发现拒绝、非法 JSON、Schema 违规和偶发失败；
- **Minimize**：保留同类失败的同时，自动生成最小 Schema；
- **Track**：持续回归固定案例，观察模型和接口升级带来的行为漂移。

**当前状态：pre-alpha。** 现阶段只实现完全离线的 `inspect` 纵向切片，不调用模型 API。

```bash
pnpm install
pnpm build
node dist/cli.js inspect examples/order.schema.json
node dist/cli.js inspect examples/order.schema.json --format json
```

当前检查严格 UTF-8、JSON 语法、重复对象键、JSON Schema 2020-12 元模式合法性，并生成
稳定 SHA-256 标识。检查通过不代表任何 LLM provider 一定接受，也不代表输出内容语义正确。

英文 README 是面向国际开源社区的主要说明。完整产品定义参见
[`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md)，长期执行标准参见
[`AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md`](AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md)。
