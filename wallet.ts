import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "@alchemy/aa-core";
import { WalletClientSigner } from "@alchemy/aa-core";


const connect = "connect wallet"
console.log(connect);



const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

console.log(account);