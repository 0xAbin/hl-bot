// import { createWalletClient, http } from 'viem'
// import {  
//   signMessage, 
//   signTransaction, 
//   signTypedData, 
//   privateKeyToAddress,
//   toAccount 
// } from 'viem/accounts'
// import { mainnet } from 'viem/chains'
 
// const privateKey = '0x...'
// const account = toAccount({
//   address: getAddress(privateKey),
//   async signMessage({ message }) {
//     return signMessage({ message, privateKey })
//   },
//   async signTransaction(transaction, { serializer }) {
//     return signTransaction({ privateKey, transaction, serializer })
//   },
//   async signTypedData(typedData) {
//     return signTypedData({ ...typedData, privateKey })
//   },
// })
 
// const client = createWalletClient({
//   account,
//   chain: mainnet,
//   transport: http()
// })