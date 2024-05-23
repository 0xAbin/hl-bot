import { encode } from "@msgpack/msgpack";
import { keccak256 } from "viem";
import { config } from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

config();

type CustomSignature = {
  r: string;
  s: string;
  v: number;
};

const IS_MAINNET = true;
const phantomDomain = {
  name: "Exchange",
  version: "1",
  chainId: 1337, // Arbitrum One chain ID
  verifyingContract: "0x0000000000000000000000000000000000000000",
};

const agentTypes = {
  Agent: [
    { name: "source", type: "string" },
    { name: "connectionId", type: "bytes32" },
  ],
};

async function signStandardL1Action(
  action: any,
  wallet: ethers.Wallet,
  nonce: number
): Promise<CustomSignature> {
  const phantomAgent = {
    source: IS_MAINNET ? "a" : "b",
    connectionId: hashAction(action, nonce),
  };
  const payloadToSign = {
    domain: phantomDomain,
    types: agentTypes,
    primaryType: "Agent",
    message: phantomAgent,
  };

  console.log("Signing payload:", JSON.stringify(payloadToSign, null, 2));

  const signedAgent = await wallet.signTypedData(
    payloadToSign.domain,
    payloadToSign.types,
    payloadToSign.message
  );

  console.log("Signed agent:", signedAgent);

  return splitSig(signedAgent);
}

function hashAction(action: any, nonce: number): string {
  const msgPackBytes = encode(action);
  console.log("action hash", Buffer.from(msgPackBytes).toString("base64"));
  const additionalBytesLength = 9;
  const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
  data.set(msgPackBytes);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  view.setBigUint64(msgPackBytes.length, BigInt(nonce));
  view.setUint8(msgPackBytes.length + 8, 0);
  return keccak256(data);
}

function splitSig(sig: string): CustomSignature {
  sig = sig.slice(2);
  if (sig.length !== 130) {
    throw new Error(`bad sig length: ${sig.length}`);
  }
  const vv = sig.slice(-2);

  if (vv !== "1c" && vv !== "1b" && vv !== "00" && vv !== "01") {
    throw new Error(`bad sig v ${vv}`);
  }
  const v = vv === "1b" || vv === "00" ? 27 : 28;
  const r = "0x" + sig.slice(0, 64);
  const s = "0x" + sig.slice(64, 128);
  return { r, s, v };
}

///place order (trade action data )

async function placeOrder() {
  const leverage = 20;
  const collateral = 1; // 1 $ Trade
  const ethPrice = 3000; // need to get Eth price api from hl

  const orderSize = (collateral * leverage) / ethPrice;

  const order = {
    asset: 10, // Asset index for ETH/USDC
    isBuy: true,
    limitPx: ethPrice.toFixed(8),
    sz: orderSize.toFixed(8),
    reduceOnly: false,
    orderType: { limit: { tif: "Gtc" } },
  };

  const action = {
    type: "order",
    grouping: "na",
    orders: [order],
  };

  const nonce = Date.now();
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }
  const wallet = new ethers.Wallet(privateKey);

  console.log("Wallet address:", wallet.address);

  try {
    const signature = await signStandardL1Action(action, wallet, nonce);
    const payload = {
      action: action,
      nonce: nonce,
      signature: signature,
      vaultAddress: null,
    };

    console.log("Payload to be sent:", JSON.stringify(payload, null, 2));

    const response = await axios.post('https://api.hyperliquid.xyz/exchange', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("Order Response:", response.data);
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

placeOrder();
