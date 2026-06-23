---
name: multi-theme-menu
description: >-
  Single source of truth for the multi-theme menu project architecture.
  Use on every task in this repository — themes, features, refactors, hooks,
  services, cart, menu, or product work. Enforces "One Logic, Many Themes":
  business logic is global; themes are presentation only.
---

# Multi-Theme Menu Project

This file is the single source of truth for the project architecture and must be followed in every task without exception.



## Core Rule

All business logic must be global.

Themes are presentation layers only.

Themes must never contain:

* API calls
* Data fetching
* Form logic
* Validation logic
* State management
* Utility functions
* Business rules
* Menu processing
* Category processing
* Cart calculations
* Product calculations
* Currency formatting
* Shared hooks

These must exist in shared global modules.

## Required Structure

```txt
src/
├── themes/
│   ├── default/
│   ├── sky/
│   ├── neon/
│   ├── coffee/
│   ├── emerald/
│   ├── noir/
│   ├── oceanic/
│   ├── pharaonic/
│   ├── arcane/
│   ├── music/
│   ├── retro/
│   └── onecard/
│
├── components/
│   ├── common/
│   ├── menu/
│   ├── product/
│   └── shared/
│
├── hooks/
│
├── services/
│
├── store/
│
├── utils/
│
├── constants/
│
├── types/
│
└── providers/
```

## Theme Responsibilities

Themes can only:

* Render UI
* Apply styling
* Define layouts
* Define animations
* Define visual appearance

Themes cannot implement custom business logic.

## Reuse First Policy

Before creating:

* Component
* Hook
* Service
* Utility
* Context
* Store

Always search the project first.

If a similar implementation exists:

* Reuse it
* Extend it
* Refactor it

Do not duplicate logic.

## Global Feature Rule

When implementing a feature:

1. Implement it globally.
2. Make it reusable.
3. Expose it through shared hooks/components.
4. Connect all themes to it.

Never implement a feature inside a single theme unless explicitly required.

## Theme Independence

Every theme should consume the same data contract.

Example:

```tsx
<MenuLayout
  menu={menu}
  categories={categories}
  products={products}
/>
```

Themes receive data.

Themes do not create data.

## Future Themes Rule

Any future theme must work without changing:

* API layer
* Store layer
* Services
* Hooks
* Business logic

Only UI should be added.

## Mandatory Review Checklist

Before every code change verify:

* Is this logic global?
* Can another theme use it?
* Is this duplicated somewhere else?
* Can this be moved to shared modules?
* Will all themes benefit from it?

If the answer is YES, implement it globally.

## Critical Rule

The project must follow:

"One Logic, Many Themes"

Never allow:

* Theme-specific business logic
* Theme-specific API logic
* Theme-specific state management

Themes are visual layers only.
