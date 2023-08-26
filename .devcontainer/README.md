# Remote Development Container

> VS Code Remote Development Container for SFCC Teams as [Recommended by Salesforce](https://developer.salesforce.com/tools/vscode/en/user-guide/remote-development).

## Table of Contents

* [Developer Setup](#developer-setup)
* [Creating Container](#creating-container)
* [Managing Container](#managing-container)
* [Script Runner](#script-runner)
* [Troubleshooting](#troubleshooting)

## Developer Setup

> Before you can use VS Code's Remote Development Containers:

- [Prerequisites](https://github.com/sfccdevops/sfcc-vscode-remote/blob/develop/docs/prerequisites.md)
- [Git Credentials](https://github.com/sfccdevops/sfcc-vscode-remote/blob/develop/docs/git-credentials.md)

## Creating Container

> To get started using your Remote Development Container in VS Code, make sure Docker Desktop is running, then complete the following:

1. Launch an empty instance of VS Code without any files, folders or workspaces open ( File > New Window )
2. Click the `Remote Explorer` icon from the VS Code Side Bar
3. Under `DEVVOLUMES` click the `Clone Repository in Container Volume`
4. You may get a prompt "Cloning a repository in a Dev Container may execute arbitrary code." click the `Got It` button.
5. Choose `Clone a repository from GitHub in a Container Volume` when prompted
6. Click `Allow` if prompted with the dialog "The extension 'GitHub' wants to sign in using GitHub." if this is your first time and complete the login process to connect VS Code and GitHub
7. For `Repository name (type to search)` search for `sfccdevops/sfra-sandbox` and then for `Branch name` select `develop`

**IMPORTANT:**

The first time you setup the container, it takes several minutes to setup. During the install process it will even look like it's ready even though it's loading stuff in the background. You'll need to wait for it to finish to avoid any issues.

You can monitor the containers build process by clicking `Dev Container: sfra-sandbox` in the bottom left corner of VS Code and selecting `Show Container Log`. The container will be ready once the logs stop updating. The last few lines in the log should look something like `[37627 ms] Port forwarding 49458 > 45609 > 45609: Local close`.

## Managing Container

> After you've created your development container, you can manage it via VS Code.

### STOP

1. Close the VS Code Window ( Yep, that's it )

### START

1. Launch an empty instance of VS Code without any files, folders or workspaces open ( File > New Window )
2. Click the `Remote Explorer` icon from the VS Code Side Bar
3. Locate `sfra-sandbox` in `CONTAINERS` > `Dev Container` list
4. Click the Open Folder Icon next to `sfra-sandbox` ( Open Folder in Container )

### REBUILD

1. Start the container
2. Click the `Remote Explorer` icon from the VS Code Side Bar
3. Locate `sfra-sandbox` in `CONTAINERS` > `Dev Container` list
4. Right Click on `sfra-sandbox` and select `Rebuild Container`

### REMOVE

1. Stop the container
2. Launch an empty instance of VS Code without any files, folders or workspaces open ( File > New Window )
3. Click the `Remote Explorer` icon from the VS Code Side Bar
4. Locate `sfra-sandbox` in `CONTAINERS` > `Dev Container` list
5. Right Click on `sfra-sandbox` and select `Remove Container`
6. Click `Remove` button for all confirmation dialogs
7. You can also safely remove `sfra-sandbox-bashhistory` from `DEVVOLUMNS`

## Script Runner

> Our VS Code Development Container has a Script Runner extension that automates our most common DevOps tasks. To access these scripts, click `Script Runner` in the Status Bar of VS Code or by pressing <kbd>F1</kbd> to access the Command Palette, and searching for `Script Runner: Run`

* `Clean Install` - This will remove all `node_modules` folders site wide and do a clean install
* `Git Reset` - This allows you to revert changes. Use `HEAD` and follow the prompts, or enter a specific SHA
* `Update` - This can be used each time you checkout a new branch of pull in changes from `develop`

**NOTE:** Script Runners can be created & expanded to automate any repetitive DevOps tasks Developers run into within VS Code.

## Troubleshooting

> Checkout the SFCC Remote Container Troubleshooting Guide for common things that can go wrong.

[![Troubleshooting](https://img.shields.io/badge/Need_help-Troubleshooting-orange.svg?style=for-the-badge&logo=github&logoColor=ffffff&logoWidth=16)](https://github.com/sfccdevops/sfcc-vscode-remote/blob/develop/docs/troubleshooting.md)
