import { INSGeneric } from "@zondax/ledger-js";

export interface SeiIns extends INSGeneric {
  GET_VERSION: 0x00;
  GET_ADDR: 0x01;
  SIGN: 0x02;
}

export interface ResponseBase {
  error_message: string;
  return_code: number;
}

export interface GenericeResponseAddress extends ResponseBase {
  address: string;
  pubKey: string;
}

export interface GenericResponseSign extends ResponseBase {
  r: Buffer;
  s: Buffer;
  v: Buffer;
}
