


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



interface IDisposable {
	dispose(): void;
}

class Disposable0 implements IDisposable {
	dispose(): any {
	}
}

interface Event0<T> {
	(listener: (e: T) => any, thisArg?: any): Disposable0;
}

export class Emitter<T> {

	private _event?: Event0<T>;
	private _listener?: (e: T) => void;
	private _this?: any;

	get event(): Event0<T> {
		if (!this._event) {
			this._event = (listener: (e: T) => any, thisArg?: any) => {

				this._listener = listener;
				this._this = thisArg;

				let result: IDisposable;
				result = {
					dispose: () => {
						this._listener = undefined;
						this._this = undefined;
					}
				};
				return result;
			};
		}
		return this._event;
	}

	fire(event: T): void {
		if (this._listener) {
			try {
				this._listener.call(this._this, event);
			} catch (e) {
			}
		}
	}

	hasListener() : boolean {
		return !!this._listener;
	}

	dispose() {
		this._listener = undefined;
		this._this = undefined;
	}
}


