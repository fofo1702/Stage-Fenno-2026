# @ui5/mcp-server Overview For UI Cards

This document describes the MCP server configured as `@ui5/mcp-server`, for example through an `mcp.json` entry like this:

```json
"@ui5/mcp-server": {
	"type": "stdio",
	"command": "npx",
	"args": [
		"-y",
		"@ui5/mcp-server"
	]
}
```

It gives a generic overview of what that MCP server can and cannot do when you are creating or modifying UI Integration Cards.

## Scope

This overview is about the package `@ui5/mcp-server` itself.

In the client, its tools may appear with names such as:

- `mcp__ui5_mcp-serv_get_integration_cards_guidelines`
- `mcp__ui5_mcp-serv_create_integration_card`
- `mcp__ui5_mcp-serv_get_project_info`
- `mcp__ui5_mcp-serv_get_api_reference`
- `mcp__ui5_mcp-serv_get_version_info`
- `mcp__ui5_mcp-serv_run_ui5_linter`
- `mcp__ui5_mcp-serv_create_ui5_app`

So when this document says "the MCP server", it means the server started from the `@ui5/mcp-server` package, even if the tool names shown by the client use a different prefix.

It is intended as a quick decision guide for people who want to know:

- what tasks the MCP server can help with directly
- what tasks it can support only indirectly
- what it does not cover as a card-specific capability

## Short answer

The UI5 MCP server is useful for UI card work, but it is not a complete end-to-end card platform.

It can help you:

- understand Integration Card best practices
- scaffold new declarative cards
- inspect UI5 projects used by component-based cards
- look up UI5 APIs
- lint UI5 code
- check UI5 framework versions
- scaffold a UI5 host application if needed

It cannot, by itself, fully design business content, invent your backend contract, or replace card-specific validation and preview workflows that depend on your local setup.

## What the MCP server can do directly

### 1. Explain Integration Card rules and best practices

Tool: `mcp__ui5_mcp-serv_get_integration_cards_guidelines`

This is the most directly relevant tool for UI cards.

It can help with:

- understanding how Integration Cards should be structured
- preferring declarative cards over custom extensions
- knowing which card types are supported
- placing data configuration in the correct manifest section
- using destinations correctly
- following `i18n` guidance
- understanding expectations for validation and preview

Use this first when the question is: "How should this card be built?"

### 2. Scaffold a new declarative Integration Card

Tool: `mcp__ui5_mcp-serv_create_integration_card`

This tool can generate a new Integration Card skeleton.

Supported card types:

- `Analytical`
- `Calendar`
- `List`
- `Object`
- `Table`
- `Timeline`

It can also include destination configuration during generation.

Use this when the question is: "Can the MCP server create a starter card for me?"

### 3. Inspect a local UI5 project

Tool: `mcp__ui5_mcp-serv_get_project_info`

This is not card-specific, but it is useful when the card lives inside a UI5 project or when the card is a `Component` card.

It can help with:

- understanding project structure
- checking framework setup
- confirming whether the local project looks like a valid UI5 project
- identifying the context around component-based cards

Use this when the question is: "What kind of UI5 project am I working in?"

### 4. Look up UI5 classes, modules, and members

Tool: `mcp__ui5_mcp-serv_get_api_reference`

This is useful when a card depends on custom UI5 code, especially in `Component` cards.

It can help with:

- checking control APIs
- checking class members and module names
- verifying whether a property or method exists
- reducing guesswork before editing controllers or views

Use this when the question is: "Is this UI5 API valid, and how do I use it?"

### 5. Check UI5 framework versions

Tool: `mcp__ui5_mcp-serv_get_version_info`

This can tell you which SAPUI5 or OpenUI5 versions exist and which ones are active or LTS.

It can help with:

- choosing a version target
- checking support level
- avoiding use of APIs that may not fit the intended UI5 baseline

Use this when the question is: "Which UI5 version should this card or host app target?"

### 6. Lint UI5 code

Tool: `mcp__ui5_mcp-serv_run_ui5_linter`

This is helpful for UI5 code quality, especially around component-based cards.

It can help with:

- detecting deprecated UI5 usage
- identifying UI5-specific code issues
- optionally fixing some findings automatically
- checking whether edits introduced UI5 problems

Use this when the question is: "Did my UI5 code change break conventions or use deprecated APIs?"

### 7. Scaffold a UI5 application

Tool: `mcp__ui5_mcp-serv_create_ui5_app`

This is adjacent to card work, not a card feature itself.

It can help with:

- creating a host app for card preview or integration
- creating a sample app around a card
- creating a UI5 app with optional OData V4 setup

Use this when the question is: "Can the MCP server also create the host app around the card?"

## What the MCP server can support only indirectly

These are tasks where the MCP server can help, but not solve the whole problem alone:

- choosing the right card type for a business use case
- shaping the manifest structure once requirements are known
- working with `Component` cards that contain custom UI5 code
- checking UI5 APIs before changing implementation details
- preparing a host app for local preview

In these cases, the MCP server is a development aid, not the full solution.

## What the MCP server cannot do directly as a card-specific feature

The UI5 MCP server does not directly provide a dedicated end-to-end feature for each of the following:

- designing the business data model for your card
- discovering the correct backend service contract on its own
- generating the perfect card content from vague requirements
- replacing manual manifest design decisions
- replacing manual review of card UX and copy
- guaranteeing that a card works in your target host environment
- replacing local preview setup when no preview infrastructure exists
- replacing card schema validation tools that are separate from these MCP tools

In short: it helps you build and check cards, but it does not fully replace product decisions, backend knowledge, or runtime verification.

## Best fit by card style

### Declarative cards

The MCP server is strongest here.

It is a good fit for:

- creating a starter card
- following Integration Card manifest best practices
- setting destinations during generation
- keeping the card aligned with standard declarative patterns

### Component cards

The MCP server is still useful, but in a different way.

It is a good fit for:

- understanding the surrounding UI5 project
- checking APIs used in controllers and views
- linting UI5 code

It is less about generating the full solution and more about supporting implementation work.

## Capability matrix

| Task | Directly supported | Notes |
| --- | --- | --- |
| Learn Integration Card rules | Yes | Use `get_integration_cards_guidelines` |
| Create a new declarative card | Yes | Use `create_integration_card` |
| Configure destinations during creation | Yes | Supported by card generation input |
| Inspect a UI5 project around a card | Yes | Use `get_project_info` |
| Look up UI5 APIs for component cards | Yes | Use `get_api_reference` |
| Check supported UI5 versions | Yes | Use `get_version_info` |
| Lint UI5 code in component cards | Yes | Use `run_ui5_linter` |
| Create a host UI5 app | Yes | Use `create_ui5_app` |
| Choose the best business design automatically | No | Requires product and UX judgment |
| Discover backend semantics automatically | No | Requires service knowledge or separate tooling |
| Guarantee host-runtime behavior | No | Requires preview and runtime testing |
| Replace all card validation workflows | No | Additional validation steps may still be needed |

## Practical guidance

If your goal is to create a UI card with MCP support, the typical sequence is:

1. start with the Integration Card guidelines
2. create a declarative card if the use case fits one of the standard card types
3. add destinations instead of hardcoded service URLs where applicable
4. use API lookup and project inspection when the card contains custom UI5 code
5. lint UI5 code for component-based cards
6. use a host app or preview setup to verify runtime behavior

## Bottom line

For UI cards, the UI5 MCP server is best understood as a strong development assistant.

It can scaffold, guide, inspect, and validate parts of the work. It does not replace the need to define requirements, understand your services, and verify the card in a real runtime context.