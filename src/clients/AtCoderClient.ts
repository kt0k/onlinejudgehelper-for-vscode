import * as cheerio from "cheerio";
import * as rp from "request-promise";
import * as tough from "tough-cookie";
import * as vscode from "vscode";
import { IOnlineJudgeClient, TestCase } from "./IOnlineJudgeClient";

const BaseUrl: string = "https://beta.atcoder.jp";
const ForParse: rp.RequestPromiseOptions = {
    transform: (body) => {
        return cheerio.load(body);
    },
};

export class AtCoderClient implements IOnlineJudgeClient {
    private readonly _client;
    private _isLoggedIn: boolean = false;

    constructor() {
        const cookie = new tough.Cookie({
            domain: "beta.atcoder.jp",
            key: "language",
            value: "ja",
        });

        const j = rp.jar();
        j.setCookie(cookie, BaseUrl);

        this._client = rp.defaults({
            jar: j,
        });
    }

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    public async login(): Promise<boolean> {
        const account = vscode.workspace.getConfiguration("onlinejudgehelper-for-vscode.accountSettings").atcoder;
        const loginUrl = BaseUrl + "/login";

        const $: CheerioStatic = await this._client.get(loginUrl, ForParse);
        const csrfToken = $('input[type="hidden"][name="csrf_token"]').val();

        const username = account.username;
        const password = account.password;

        const loginOptions = {
            form: {
                username,
                password,
                csrf_token: csrfToken,
            },
            followAllRedirects: true,
        };

        const res: string = await this._client.post(loginUrl, loginOptions);

        if (res.match("ユーザ名またはパスワードが正しくありません。")) {
            return false;
        } else {
            this._isLoggedIn = true;
            return true;
        }
    }

    public async getProblemId(url: string): Promise<string> {
        const re = new RegExp(/contests\/(\w+)\/tasks\/(\w+)$/);
        const match = url.match(re);
        return `${match[2]}`;
    }

    public async getTestCases(url: string): Promise<TestCase[]> {
        const html: string = await this._client.get(url);
        const $ = cheerio.load(html);
        const inputs: string[] = [];
        const expected: string[] = [];

        const re = new RegExp(/実行時間制限: (\d)+ sec \/ メモリ制限: (\d)+ MB/);
        const timeLimit = parseFloat(html.match(re)[1]) * 1000;

        $("h3").each((i, elem) => {
            let found = $(elem).text().match(/入力例\s*(\d+)/);
            if (found) {
                inputs[parseInt(found[1], 10) - 1] = $(elem).parent().find("pre").text().trim() + "\n";
            }
            found = $(elem).text().match(/出力例\s*(\d+)/);
            if (found) {
                expected[parseInt(found[1], 10) - 1] = $(elem).parent().find("pre").text().trim() + "\n";
            }
        });

        const ret: TestCase[] = [];
        for (let i = 0; i < inputs.length; i++) {
            ret[i] = {
                name: `samplecase_${i}`,
                input: inputs[i],
                expected: expected[i],
                timeLimit,
            };
        }

        vscode.window.showInformationMessage(timeLimit.toString());
        return ret;
    }

    public submit(sourceFilePath: string) {
        throw new Error("Method not implemented.");
    }
}
