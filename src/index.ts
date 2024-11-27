/** ******************************************************************************
 *  (c) 2019-2024 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
import type Transport from "@ledgerhq/hw-transport";
import Eth from "@ledgerhq/hw-app-eth";
import BaseApp, { BIP32Path, INSGeneric, processErrorResponse, processResponse } from "@zondax/ledger-js";
import { LedgerEthTransactionResolution, LoadConfig } from "@ledgerhq/hw-app-eth/lib/services/types";
import { CLA } from "./consts";
import { GenericResponseSign, GenericeResponseAddress } from "./types";

export class SeiApp extends BaseApp {
  private evm;

  static _INS = {
    GET_VERSION: 0x00 as number,
    GET_ADDR: 0x01 as number,
    SIGN: 0x02 as number,
  };

  static _params = {
    cla: CLA,
    ins: { ...SeiApp._INS } as INSGeneric,
    p1Values: { ONLY_RETRIEVE: 0x00 as 0, SHOW_ADDRESS_IN_DEVICE: 0x01 as 1 },
    chunkSize: 250,
    requiredPathLengths: [5],
  };

  constructor(transport: Transport, ethScrambleKey = "w0w", ethLoadConfig: LoadConfig = {}) {
    super(transport, SeiApp._params);
    if (!this.transport) {
      throw new Error("Transport has not been defined");
    }

    this.evm = new Eth(transport, ethScrambleKey, ethLoadConfig);
  }

  async getCosmosAddress(path: BIP32Path, showAddrInDevice = false): Promise<GenericeResponseAddress> {
    const p1 = showAddrInDevice ? this.P1_VALUES.SHOW_ADDRESS_IN_DEVICE : this.P1_VALUES.ONLY_RETRIEVE;
    const serializedPath = this.serializePath(path);

    try {
      const responseBuffer = await this.transport.send(this.CLA, this.INS.GET_ADDR, p1, 0, serializedPath);

      const response = processResponse(responseBuffer);

      const pubKey = response.readBytes(33).toString("hex");
      const address = response.readBytes(response.length()).toString("ascii");

      return {
        pubKey,
        address,
        return_code: 0x9000,
        error_message: "No errors",
      } as GenericeResponseAddress;
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async signCosmos(path: BIP32Path, message: Buffer): Promise<GenericResponseSign> {
    const chunks = this.prepareChunks(path, message);
    try {
      let result = await this.signSendChunk(SeiApp._INS.SIGN, 1, chunks.length, chunks[0]);
      for (let i = 1; i < chunks.length; i += 1) {
        result = await this.signSendChunk(SeiApp._INS.SIGN, 1 + i, chunks.length, chunks[i]);
      }

      return {
        r: result.readBytes(32),
        s: result.readBytes(32),
        v: result.readBytes(1),
        return_code: 0x9000,
        error_message: "No errors",
      };
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async signEVM(
    path: string,
    rawTxHex: string,
    resolution?: LedgerEthTransactionResolution | null,
  ): Promise<{
    s: string;
    v: string;
    r: string;
  }> {
    try {
      return await this.evm.signTransaction(path, rawTxHex, resolution);
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async getEVMAddress(
    path: string,
    boolDisplay?: boolean,
    boolChaincode?: boolean,
  ): Promise<{
    publicKey: string;
    address: string;
    chainCode?: string;
  }> {
    try {
      return await this.evm.getAddress(path, boolDisplay, boolChaincode);
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async signPersonalMessage(path: string, messageHex: string): Promise<{ v: number; s: string; r: string }> {
    return this.evm.signPersonalMessage(path, messageHex);
  }
}
