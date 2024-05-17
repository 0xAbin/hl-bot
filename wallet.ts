import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "@alchemy/aa-core";
import { WalletClientSigner } from "@alchemy/aa-core";
import { config } from 'dotenv';
config();


// const connect = "connect wallet"
// console.log(connect);
const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
console.log(account);


export const client = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

//   console.log(client)



export const eoaSigner = new WalletClientSigner(
 client,
"local"
);

// console.log(eoaSigner)