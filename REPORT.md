# Lab 17: report evidence

Scope: tasks 1-3 only. Captured from actual Windows Command Prompt windows.

| Report requirement | Screenshot |
| --- | --- |
| Task 1: no arguments, greet and info | [View](screenshots/task1.png) |
| Task 1: unknown command and exit codes 1 / 0 | [View](screenshots/task1-errors.png) |
| Task 2: main --help | [View](screenshots/task2-help.png) |
| Task 2: generate --help and --version | [View](screenshots/task2-generate-help.png) |
| Task 2: options, verbose mode and generated report | [View](screenshots/task2-options.png) |
| Task 2: --dry-run without file creation and invalid type | [View](screenshots/task2-dry-run.png) |
| Task 3: full interactive dialogue (input, list, checkbox, confirm, masked password) | [View](screenshots/task3-interactive.png) |
| Task 3: flags, missing-data error and stdin (failure and success) | [View](screenshots/task3-flags-stdin.png) |

The interactive run shows questions and masked input. The flag and stdin runs complete without questions. Exit codes are printed using `echo %ERRORLEVEL%` (CMD expands the variable in batch-command echoes).
