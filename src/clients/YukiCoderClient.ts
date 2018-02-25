import * as cheerio from "cheerio";
import * as rp from "request-promise";
import * as tough from "tough-cookie";
import * as vscode from "vscode";
import { IOnlineJudgeClient, TestCase } from "./IOnlineJudgeClient";

const BaseURL = "https://yukicoder.me/";
const ForParse: rp.RequestPromiseOptions = {
    transform: (body) => {
        return cheerio.load(body);
    },
};

export class YukiCoderClient implements IOnlineJudgeClient {
    get isLoggedIn(): boolean {
        return true;
    }

    public login(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public async getProblemId(url: string): Promise<string> {
        const re = new RegExp(/problems\/no\/(\d+)/);
        const match = url.match(re);
        return `no-${match[1]}`;
    }

    public async getTestCases(url: string): Promise<any[]> {
        const html: string = await rp.get(url);
        const $ = cheerio.load(html);
        const inputs: string[] = [];
        const expected: string[] = [];

        const re = new RegExp(/実行時間制限 : 1ケース (\d+.\d+)(秒|sec) \/ メモリ制限 : (\d+) MB/);

        const res = html.match(re);

        const timeLimit = parseFloat(res[1]) * 1000;

        $("h5").each((i, elem) => {
            const found = $(elem).text().match(/サンプル(\d+)/);
            if (found) {
                const labels = $(elem).siblings("div").find("h6");
                inputs[parseInt(found[1], 10)] = $(labels[0]).next("pre").text().trim() + "\n";
                expected[parseInt(found[1], 10)] = $(labels[1]).next("pre").text().trim() + "\n";
            }
        });

        const ret: TestCase[] = [];
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i] || !expected[i]) {
                continue;
            }

            ret[i] = {
                name: `samplecase_${i}`,
                input: inputs[i],
                expected: expected[i],
                timeLimit,
            };
        }

        return ret;
    }

    public submit(sourceFilePath: string) {
        throw new Error("Method not implemented.");
    }
}
