---
name: write-commit-message
description: Generate a structured Git commit message based on Title, URL, change details, and push it.
user-invocable: true
---

# Generate Commit Message

Generate a structured commit message and a single-line command for instant execution.

## Usage

/commit

## Instructions

1. Information Retrieval: 
   - Analyze provided parameters or git diff contents.
2. Determine Type: Use feat, fix, refactor, style, docs, perf, test, chore, or revert

3. Generate Message:
 - Line 1: type: Auto-generated English Title]
 - Line 2: (Empty line)
 - Body: Summary of changes in English.
   
4. Push this commit message.

## Validation Logic

[type]: [Title]

- [Detail 1]
- [Detail 2]

## Output Template

```text
[type]: [Title]

- [Detail 1]
- [Detail 2]
