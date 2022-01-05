import type { Transaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { EventEmitter } from "eventemitter3";

import type { WalletAdapter } from "../types";

export class ReadonlyAdapter extends EventEmitter implements WalletAdapter {
  private _publicKey: PublicKey | null = null;

  constructor() {
    super();

    const localPubkey =
      process.env.REACT_APP_LOCAL_PUBKEY ?? process.env.LOCAL_PUBKEY;
    if (!localPubkey) {
      console.warn("LOCAL_PUBKEY not set for readonly provider");
    } else {
      this._publicKey = new PublicKey(localPubkey);
    }
  }

  get connected(): boolean {
    return true;
  }

  get autoApprove(): boolean {
    return false;
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  signAllTransactions(_transactions: Transaction[]): Promise<Transaction[]> {
    throw new Error("readonly adapter cannot sign transactions");
  }

  signTransaction(_transaction: Transaction): Promise<Transaction> {
    throw new Error("readonly adapter cannot sign transactions");
  }

  connect = (): Promise<void> => {
    this.emit("connect", this._publicKey);
    return Promise.resolve();
  };

  disconnect(): void {
    this.emit("disconnect");
  }
}