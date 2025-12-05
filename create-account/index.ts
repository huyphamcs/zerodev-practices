import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import "dotenv/config"
import { createPublicClient, http, zeroAddress } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
if (!process.env.ZERODEV_RPC) {
    throw new Error("ZeroDev RPC is not added");
}
const chain = sepolia;
const privateKey = generatePrivateKey();
const signer = privateKeyToAccount(privateKey);


const publicClient = createPublicClient({
    chain,
    transport: http(process.env.ZERODEV_RPC)
})

const entryPoint = getEntryPoint("0.7");
const kernelVersion = KERNEL_V3_1;

const main = async () => {
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion,
    })

    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion,
    })
    console.log("Account address: ", account.address);

    const paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(process.env.ZERODEV_RPC)
    })
    const kernelClient = createKernelAccountClient({
        account,
        chain,
        bundlerTransport: http(process.env.ZERODEV_RPC),
        client: publicClient,
        paymaster: {
            getPaymasterData: (userOperation) => {
                return paymasterClient.sponsorUserOperation({
                    userOperation
                })
            }
        }
    })

    const userOpHash = await kernelClient.sendUserOperation({
        callData: await account.encodeCalls([
            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x",
            }
        ])
    })
    console.log("User operation hash: ", userOpHash);
    const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash
    })
    console.log("TXN hash: ", receipt.receipt.transactionHash);

    process.exit(0);
}
main()