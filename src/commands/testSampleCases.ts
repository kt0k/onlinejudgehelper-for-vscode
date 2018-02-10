import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { TestCase } from "../clients/IOnlineJudgeClient";
import { Tester } from "../Tester";

export async function testSampleCases(outputChannel: vscode.OutputChannel): Promise<void> {
    const tmp = path.join(vscode.workspace.rootPath, "samplecases");
    const lis = await fs.readdir(tmp);

    const dirs = lis.filter((item) => {
        const stats = fs.statSync(path.join(tmp, item));
        return stats.isDirectory();
    });
    const dir = await vscode.window.showQuickPick(dirs);

    const sampleCasesDir = path.join(tmp, dir);
    const sampleCases = await fs.readdir(sampleCasesDir);
    const inputs = sampleCases.map((name) => path.join(sampleCasesDir, name)).filter((abspath) => path.extname(abspath) === ".in").sort();
    const outputs = sampleCases.map((name) => path.join(sampleCasesDir, name)).filter((abspath) => path.extname(abspath) === ".exp").sort();

    const testcases: TestCase[] = [];
    let timeLimit: number;
    await fs.readFile(path.join(sampleCasesDir, "timeLimit")).then((str) => {
        timeLimit = parseFloat(str.toString());
    });

    for (const input of inputs) {
        for (const output of outputs) {
            if (input.slice(0, -3) !== output.slice(0, -4)) {
                continue;
            }
            const testcaseName = path.basename(input).slice(0, -3);
            const [inputContent, outputContent] = await Promise.all([fs.readFile(input), fs.readFile(output)]);
            testcases.push({
                name: testcaseName,
                input: inputContent.toString(),
                expected: outputContent.toString(),
                timeLimit,
            });
            break;
        }
    }

    Tester.test(vscode.window.activeTextEditor.document, testcases, timeLimit, outputChannel);
}
