import * as cp from "child_process";
import * as path from "path";
import * as stream from "stream";
import * as vscode from "vscode";
import { TestCase } from "./clients/IOnlineJudgeClient";

export class Tester {
    public static async test(document: vscode.TextDocument, testCases: TestCase[], timeout: number, outputChannel: vscode.OutputChannel) {
        const languageId = document.languageId;
        const compileCmd: string = vscode.workspace.getConfiguration("extensions.compileCommand")[languageId];
        const runCmd: string = vscode.workspace.getConfiguration("extensions.runCommand")[languageId];
        const cwd = path.dirname(document.uri.fsPath);

        outputChannel.clear();
        outputChannel.show();

        if (!(compileCmd || runCmd)) {
            outputChannel.appendLine("コマンドが設定されていないか、対応していない言語です");
        }

        if (compileCmd) {
            outputChannel.appendLine("Compiling...");
            const compileResult = await Tester.executeCommand(cwd, [compileCmd, document.fileName].join(" "));
            if (compileResult.exitCode || compileResult.stderr) {
                outputChannel.appendLine("Compile Failed");
                outputChannel.appendLine(`Exit Code: ${compileResult.exitCode}`);
                outputChannel.appendLine("--stderr--");
                outputChannel.appendLine(`${compileResult.stderr}\n`);
                return;
            }
            outputChannel.appendLine("Compile Completed Successfully");
        }

        if (runCmd) {
            const all = testCases.length;
            let passed = 0;

            const promises = testCases.map((testcase, i) => async () => {
                outputChannel.appendLine(`(${i + 1}/${all})Testing ${testcase.name}`);
                const targetFile = compileCmd ? "" : document.fileName;
                const result = await Tester.executeCommand(cwd, [runCmd, targetFile].join(" "), testcase.input, timeout);
                result.stdout = result.stdout.replace("\r\n", "\n");
                testcase.expected = testcase.expected.replace("\r\n", "\n");
                if (result.stdout === testcase.expected) {
                    outputChannel.appendLine(`Accepted! (${result.time}ms)`);
                    passed++;
                } else {
                    if (result.time > timeout) {
                        outputChannel.appendLine("Time Limit Exceeded");
                    } else if (result.exitCode) {
                        outputChannel.appendLine(`Error (ExitCode: ${result.exitCode})`);
                        outputChannel.appendLine("--stderr--");
                        outputChannel.appendLine(`${result.stderr}\n`);
                    } else {
                        outputChannel.appendLine("Wrong Answer");
                        outputChannel.appendLine("--Expected--");
                        outputChannel.appendLine(`${testcase.expected}`);
                        outputChannel.appendLine("--Actual Output--");
                        outputChannel.appendLine(`${result.stdout}`);
                    }
                }
            });

            promises.push(async () => {
                if (passed === all) {
                    outputChannel.appendLine("All Tests Passed!");
                } else {
                    outputChannel.appendLine(`Passed: ${passed}/${all}`);
                }
            });

            const start = promises.reduce((prev, curr) => {
                return () => prev().then(() => curr());
            }, async () => {});

            start();
        }
    }

    private static executeCommand(cwd: string, cmd: string, input?: string, timeout?: number): Promise<RunResult> {
        return new Promise<RunResult>((resolve, reject) => {
            const inputStream = new stream.PassThrough();
            inputStream.push(input);

            let start: number;
            let end: number;

            const p = cp.exec(cmd, {cwd});

            start = Date.now();

            if (timeout) {
                setTimeout(() => {
                    p.kill();
                }, timeout);
            }

            inputStream.pipe(p.stdin);

            let stderr: string = "";
            let stdout: string = "";
            p.stdout.on("data", (chunk) => {
                stdout += chunk.toString();
            });

            p.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });

            p.on("exit", (exitCode, signal) => {
                end = Date.now();
                const time = end - start;
                resolve({exitCode, time, stdout, stderr});
            });
        });
    }
}

interface RunResult {
    exitCode: number;
    stdout: string;
    stderr: string;
    time: number;
}
