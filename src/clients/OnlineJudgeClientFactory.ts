import * as url from "url";

import { IOnlineJudgeClient } from "./IOnlineJudgeClient";
import { OnlineJudge } from "./OnlineJudges";

import { AtCoderClient } from "./AtCoderClient";
import { YukiCoderClient } from "./YukiCoderClient";

export const HostnameMap: {[hostname: string]: OnlineJudge} = {
    "beta.atcoder.jp": OnlineJudge.AtCoder,
    "yukicoder.me": OnlineJudge.yukiCoder,
};

export class OnlineJudgeClient {
    public static FromUrl(urlString: string): IOnlineJudgeClient {
        const hostname = url.parse(urlString).hostname;
        const ojType = HostnameMap[hostname];
        if (!this._clientMap[ojType]) {
            switch (ojType) {
                case OnlineJudge.AtCoder:
                    this._clientMap[ojType] = new AtCoderClient();
                    break;
                case OnlineJudge.yukiCoder:
                    this._clientMap[ojType] = new YukiCoderClient();
                    break;
                default:
                    throw new Error("対応していないURLです");
            }
        }

        return this._clientMap[ojType];
    }

    private static _clientMap: { [id: number]: IOnlineJudgeClient} = {};
}
