# WIP: vscDebugger wrapper

## What
This is a wrapper for the R package [vscDebugger](https://github.com/ManuelHentschel/vscDebugger),
which implements the [DAP](https://microsoft.github.io/debug-adapter-protocol/)
in R.

The code is copied from the vscode extension
[vscode-r-debugger](https://github.com/ManuelHentschel/VSCode-R-Debugger)
and modified to run as an independent node script.

This repository is meant to be a "proof of concept", not a properly working program.
In many places the code was only provisionally modified so far that it does not depend on vscode anymore.

## Why
The R package [vscDebugger](https://github.com/ManuelHentschel/vscDebugger)
implements most parts of the DAP but is limited by the fact that it is running as a package in the same R process as the debugged script.
As a consequence, it cannot step through the code or handle `browser()` statements in user code.
The typescript code fills these gaps and notifies the R package when the R process shows the browser prompt
and types e.g. `n`, `f`, `c` to its stdin when requested by the R package.

## How
Install dependencies with `npm install`, compile with `tsc`, and then launch with `node out/index.js`.
R needs to be on the PATH or in the registry.
By default, the debug adapter will listen on `localhost:12321`.

Then launch a debug client e.g. with the following config:
``` json
{
    "type": "R-Debugger",
    "request": "launch",
    "name": "Launch R Debugger",
    "host": "localhost",
    "workingDirectory": ".",
    "port": 12321,
    "debugMode": "file",
    "file": "PATH/TO/YOUR/FILE",
    "includePackageScopes": true,
    "allowGlobalDebugging": true
}
```

So far, I've tried using the debug adapter with a separate VS Code extension
that simply calls `vscode.DebugAdapterServer(12321, "localhost")`
and with the [DAP implementation for Eclipse](https://projects.eclipse.org/projects/technology.lsp4e).
Both clients seemed to work okay, though still rather buggy.
