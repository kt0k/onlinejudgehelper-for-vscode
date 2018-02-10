import * as url from "url";

import { IOnlineJudgeClient } from "./IOnlineJudgeClient";
import { OnlineJudge } from "./OnlineJudges";

import { AtCoderClient } from "./AtCoderClient";
import { YukiCoderClient } from "./YukiCoderClient";

export const HostnameMap = {
    "beta.atcoder.jp": OnlineJudge.AtCoder,
    "yukicoder.me": OnlineJudge.yukiCoder,
};

export class OnlineJudgeClientFactory {
    public static createFromUrl(urlString: string): IOnlineJudgeClient {
        const hostname = url.parse(urlString).hostname;
        switch (HostnameMap[hostname]) {
            case OnlineJudge.AtCoder:
                return new AtCoderClient();
            case OnlineJudge.yukiCoder:
                return new YukiCoderClient();
            default:
                throw new Error("対応していないURLです");
        }
    }
}
