import { IOnlineJudgeClient } from "./IOnlineJudgeClient";

export class YukiCoderClient implements IOnlineJudgeClient {
    get isLoggedIn(): boolean {
        return false;
    }

    public login(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public getProblemId(url: string): Promise<string> {
        throw new Error("Method not implemented");
    }

    public getTestCases(url: string): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

    public submit(sourceFilePath: string) {
        throw new Error("Method not implemented.");
    }
}
