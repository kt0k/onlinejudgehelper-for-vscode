import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { OnlineJudgeClient } from "../clients/OnlineJudgeClientFactory";

export async function getSampleCases() {
    const url = await vscode.window.showInputBox({placeHolder: "URLを入力してください", ignoreFocusOut: true});

    if (!url) {
        return;
    }

    const client = OnlineJudgeClient.FromUrl(url);
    if (!client.isLoggedIn) {
        await client.login();
    }

    const task = client.getTestCases(url);
    const problemId = await client.getProblemId(url);
    const savePath = `${vscode.workspace.rootPath}/samplecases/${problemId}`;
    fs.mkdirs(savePath);
    const testCases = await task;

    await Promise.all(testCases.map((t) => {
        return Promise.all([
            fs.writeFile(path.join(savePath, "timeLimit"), t.timeLimit),
            fs.writeFile(path.join(savePath, `${t.name}.in`), t.input),
            fs.writeFile(path.join(savePath, `${t.name}.exp`), t.expected),
        ]);
    }));
}
