import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";
import { EntryPointVersion } from "viem/account-abstraction";
import { GetKernelVersion } from "@zerodev/sdk/types/kernel";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createPublicClient, http } from "viem";
import { KernelAccountClient, createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";


const ZERODEV_RPC=process.env.ZERODEV_RPC
const chain = sepolia
const kernelVersion = KERNEL_V3_1
const privateKey = generatePrivateKey();
const signer = privateKeyToAccount(privateKey);
export const publicClient = createPublicClient({
    chain: chain,
    transport: http(ZERODEV_RPC)
})

export const getKernelClient = async <entryPointVersion extends EntryPointVersion> (
    entryPointVersion_: entryPointVersion,
    kernelVersion: GetKernelVersion<entryPointVersion>
) => {

    const entryPoint = getEntryPoint(entryPointVersion_)
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion
    })
    const account = await createKernelAccount(publicClient, {
        plugins:{
            sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion
    })
    console.log("Account address: ", account.address);

    const paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(ZERODEV_RPC)
    })
    
    const kernelClient = await createKernelAccountClient({
        account,
        chain,
        bundlerTransport: http(ZERODEV_RPC),
        client: publicClient,
        paymaster:
        {
            getPaymasterData: (userOperation) => {return paymasterClient.sponsorUserOperation({userOperation})}
        }
    })
    return {
        entryPoint,
        ecdsaValidator,
        account,
        paymasterClient,
        kernelClient
    }
}


export const getReceiptFromUserOpHash = async (
    kernelClient: KernelAccountClient,
    userOpHash: `0x${string}`
) => {
    const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash
    })
    return receipt
}