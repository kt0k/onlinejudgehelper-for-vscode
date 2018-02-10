"use strict";

import * as path from "path";
import * as vscode from "vscode";

import { getSampleCases } from "./commands/getSampleCases";
import { testSampleCases } from "./commands/testSampleCases";

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("OnlineJudgeHelper");

    context.subscriptions.push(vscode.commands.registerCommand("onlinejudgehelper-for-vscode.getSampleCases", async () => await getSampleCases()));
    context.subscriptions.push(vscode.commands.registerCommand(
        "onlinejudgehelper-for-vscode.testSampleCases", async () => await testSampleCases(outputChannel)));
}

export function deactivate() {
}
