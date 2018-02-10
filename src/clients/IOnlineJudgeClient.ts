import * as url from "url";

import { AtCoderClient } from "./AtCoderClient";

export interface IOnlineJudgeClient {
    isLoggedIn: boolean;
    login(): Promise<boolean>;
    getTestCases(url: string): Promise<TestCase[]>;
    getProblemId(url: string): Promise<string>;
    submit(sourceFilePath: string);
}

export interface TestCase {
    name: string;
    input: string;
    expected: string;
    timeLimit: number;
}
