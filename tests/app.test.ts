/******************************************************************************
 *  (c) 2018 - 2024 Zondax AG
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
 *****************************************************************************/
import { MockTransport } from "@ledgerhq/hw-transport-mocker";

import { SeiApp } from "../src";
import {
  EVM_TRANSFER_BLOB,
  EXPECTED_ADDRESS,
  EXPECTED_ETH_ADDRESS,
  EXPECTED_ETH_PK,
  EXPECTED_PK,
  EXPECTED_R_1_VALUE,
  EXPECTED_R_VALUE,
  EXPECTED_S_1_VALUE,
  EXPECTED_S_VALUE,
  EXPECTED_V_1_VALUE,
  EXPECTED_V_VALUE,
  GET_ADDRESS_RESPONSE_APDU,
  GET_EVM_ADDRESS_RESPONSE_APDU,
  SIGN_EVM_TRANSACTION_RESPONSE_APDU,
  SIGN_TRANSACTION_RESPONSE_APDU,
  TRANSFER_BLOB,
} from "./helper";

const ETH_PATH = "m/44'/60'/0'/0'/5";

describe("SeiApp", () => {
  it("Retreive valid EVM public key and address", async () => {
    // Response Payload from getEVMAddress with "m/44'/60'/0'/0'/5"
    const responseBuffer = Buffer.from(GET_EVM_ADDRESS_RESPONSE_APDU, "hex");

    const transport = new MockTransport(responseBuffer);
    const app = new SeiApp(transport);
    const resp = await app.getEVMAddress(ETH_PATH);

    expect(resp.publicKey.toString()).toEqual(EXPECTED_ETH_PK);
    expect(resp.address.toString()).toEqual(EXPECTED_ETH_ADDRESS);
  });

  it("Retreive valid EVM signature", async () => {
    // Response Payload from signing
    const responseBuffer = Buffer.from(SIGN_EVM_TRANSACTION_RESPONSE_APDU, "hex");

    const transport = new MockTransport(responseBuffer);
    const app = new SeiApp(transport);
    const resp = await app.signEVM(ETH_PATH, Buffer.from(EVM_TRANSFER_BLOB, "hex"));

    expect(resp.r.toString()).toEqual(EXPECTED_R_VALUE);
    expect(resp.s.toString()).toEqual(EXPECTED_S_VALUE);
    expect(resp.v.toString()).toEqual(EXPECTED_V_VALUE);
  });

  it("Retreive valid public key and address", async () => {
    const responseBuffer = Buffer.from(GET_ADDRESS_RESPONSE_APDU, "hex");

    const transport = new MockTransport(responseBuffer);
    const app = new SeiApp(transport);
    const resp = await app.getCosmosAddress(ETH_PATH);

    expect(resp.pubKey.toString()).toEqual(EXPECTED_PK);
    expect(resp.address.toString()).toEqual(EXPECTED_ADDRESS);
  });

  it("Retreive valid signature", async () => {
    const responseBuffer = Buffer.from(SIGN_TRANSACTION_RESPONSE_APDU, "hex");

    const transport = new MockTransport(responseBuffer);
    const app = new SeiApp(transport);
    const resp = await app.signCosmos(ETH_PATH, Buffer.from(TRANSFER_BLOB, "hex"));

    expect(resp.r.toString("hex")).toEqual(EXPECTED_R_1_VALUE);
    expect(resp.s.toString("hex")).toEqual(EXPECTED_S_1_VALUE);
    expect(resp.v.toString("hex")).toEqual(EXPECTED_V_1_VALUE);
  });
});
