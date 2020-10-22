


import * as vscode from 'vscode';


export class PseudoConfiguration implements vscode.WorkspaceConfiguration {

    get<T>(section: string, defaultValue?: T): T {
        return defaultValue;
    }

    has(section: string): boolean {
        return false;
    }

    inspect<T>(section: string): undefined {
        return undefined;
    }

    update(section: string, value: any) {
        return undefined;
    }
}
