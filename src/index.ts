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
import BaseApp, { INSGeneric } from "@zondax/ledger-js";
import { LedgerEthTransactionResolution, LoadConfig } from "@ledgerhq/hw-app-eth/lib/services/types";

export class SeiApp extends BaseApp {
  private eth;

  static _INS = {
    GET_VERSION: 0x00 as number,
    GET_ADDR: 0x01 as number,
    SIGN: 0x02 as number,
  };

  static _params = {
    cla: 0x62,
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

    this.eth = new Eth(transport, ethScrambleKey, ethLoadConfig);
  }

  async signEVMTransaction(
    path: string,
    rawTxHex: any,
    resolution?: LedgerEthTransactionResolution | null,
  ): Promise<{
    s: string;
    v: string;
    r: string;
  }> {
    return this.eth.signTransaction(path, rawTxHex, resolution);
  }

  async getETHAddress(
    path: string,
    boolDisplay?: boolean,
    boolChaincode?: boolean,
  ): Promise<{
    publicKey: string;
    address: string;
    chainCode?: string;
  }> {
    return this.eth.getAddress(path, boolDisplay, boolChaincode);
  }
}
