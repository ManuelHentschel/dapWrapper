/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as ee from 'events';
import { DebugProtocol } from 'vscode-debugprotocol';
import { DebugAdapter } from './debugAdapter';



export class ProtocolServer extends ee.EventEmitter {

	private static TWO_CRLF = '\r\n\r\n';


	private _rawData: Buffer;
	private _contentLength: number;
	private _sequence: number;
	private _writableStream: NodeJS.WritableStream;

	private _debugAdapter: DebugAdapter;

	constructor() {
		super();

		this._debugAdapter = new DebugAdapter();

		this._debugAdapter.onDidSendMessage((msg) => {
			this._send(msg);
		});
	}

	// ---- implements vscode.Debugadapter interface ---------------------------

	public dispose(): any {
		this._debugAdapter.dispose();
	}


	public handleMessage(msg: DebugProtocol.ProtocolMessage): void {
		this._debugAdapter.handleMessage(msg);
	}

	//--------------------------------------------------------------------------

	public start(inStream: NodeJS.ReadableStream, outStream: NodeJS.WritableStream): void {
		this._sequence = 1;
		this._writableStream = outStream;
		this._rawData = Buffer.alloc(0);

		inStream.on('data', (data: Buffer) => {
			this._handleData(data);
		});

		inStream.on('close', () => {
			this.emit('close');
		});
		inStream.on('error', (error) => {
			this.emit('error', error);
		});

		outStream.on('error', (error) => {
			this.emit('error', error);
		});

		inStream.resume();
	}

	public stop(): void {
		if (this._writableStream) {
			this._writableStream.end();
		}
	}


	// ---- private ------------------------------------------------------------

	private _send(message: DebugProtocol.ProtocolMessage): void {

		message.seq = this._sequence++;
		const json = JSON.stringify(message);
		this._writableStream.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`, 'utf8');
	}

	private _handleData(data: Buffer): void {

		this._rawData = Buffer.concat([this._rawData, data]);

		while (true) {
			if (this._contentLength >= 0) {
				if (this._rawData.length >= this._contentLength) {
					const message = this._rawData.toString('utf8', 0, this._contentLength);
					this._rawData = this._rawData.slice(this._contentLength);
					this._contentLength = -1;
					if (message.length > 0) {
						try {
							let msg: DebugProtocol.ProtocolMessage = JSON.parse(message);
							this.handleMessage(msg);
						} catch (e) {
						}
					}
					continue;	// there may be more complete messages to process
				}
			} else {
				const idx = this._rawData.indexOf(ProtocolServer.TWO_CRLF);
				if (idx !== -1) {
					const header = this._rawData.toString('utf8', 0, idx);
					const lines = header.split('\r\n');
					for (let i = 0; i < lines.length; i++) {
						const pair = lines[i].split(/: +/);
						if (pair[0] === 'Content-Length') {
							this._contentLength = +pair[1];
						}
					}
					this._rawData = this._rawData.slice(idx + ProtocolServer.TWO_CRLF.length);
					continue;
				}
			}
			break;
		}
	}
}
