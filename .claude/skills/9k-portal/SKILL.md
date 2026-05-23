```markdown
# 9k-portal Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `9k-portal` JavaScript codebase. You'll learn how to structure files, write imports/exports, follow commit message practices, and understand testing patterns. This guide is ideal for onboarding new contributors or maintaining consistency across the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.js`, `dataFetcher.js`

### Import Style
- Use **relative imports** to reference modules within the project.
  - Example:
    ```javascript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports** for functions, constants, and components.
  - Example:
    ```javascript
    // In dataFetcher.js
    export function fetchData() { ... }
    export const API_URL = '...';
    ```

### Commit Messages
- **Freeform** style, no enforced prefixes.
- Average commit message length: ~27 characters.
  - Example:
    ```
    fix bug in user login flow
    add loading spinner to dashboard
    ```

## Workflows

### Adding a New Module
**Trigger:** When creating a new feature or utility module  
**Command:** `/add-module`

1. Create a new file using camelCase naming (e.g., `newFeature.js`).
2. Write your code using named exports.
3. Import your module where needed using a relative path.
4. Commit your changes with a clear, concise message.

### Updating an Existing Module
**Trigger:** When modifying or enhancing existing functionality  
**Command:** `/update-module`

1. Locate the relevant file (camelCase).
2. Make your changes, ensuring you maintain named exports.
3. Update any imports if necessary.
4. Write a descriptive commit message.

### Writing Tests
**Trigger:** When adding or updating code that requires testing  
**Command:** `/write-test`

1. Create a test file following the `*.test.*` pattern (e.g., `userProfile.test.js`).
2. Write your test cases for the corresponding module.
3. Use the project's preferred (unknown) testing framework.
4. Run tests to ensure correctness.

## Testing Patterns

- Test files are named using the `*.test.*` pattern (e.g., `feature.test.js`).
- The specific testing framework is **unknown**, but tests should be colocated with or near the files they test.
- Example test file:
  ```javascript
  // userProfile.test.js
  import { getUserProfile } from './userProfile';

  test('returns correct user data', () => {
    const result = getUserProfile('user123');
    expect(result.id).toBe('user123');
  });
  ```

## Commands
| Command         | Purpose                                  |
|-----------------|------------------------------------------|
| /add-module     | Scaffold a new module with conventions   |
| /update-module  | Update an existing module                |
| /write-test     | Add or update a test file                |
```
