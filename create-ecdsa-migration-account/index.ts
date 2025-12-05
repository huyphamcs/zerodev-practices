import "dotenv/config"
import { createEcdsaKernelMigrationAccount, signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getKernelVersion } from "@zerodev/sdk/actions";
import { KERNEL_V3_0, KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { createPublicClient, http, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains";

const privateKey = generatePrivateKey();
const signer = privateKeyToAccount(privateKey);
const chain = sepolia;
const entryPoint = getEntryPoint("0.7");
const ZERODEV_RPC = process.env.ZERODEV_RPC;
const publicClient = createPublicClient({
    chain,
    transport: http(ZERODEV_RPC)
})



const main = async () => {
    const originalKernelVersion = KERNEL_V3_0;
    // const newKernelVersion = KERNEL_V3_1;
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion: originalKernelVersion
    })
    const account = await createKernelAccount(publicClient, {
        plugins:{
            sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion: originalKernelVersion
    })

    console.log("Account address: ", account.address);

    const paymasterClient = createZeroDevPaymasterClient({
        chain: chain,
        transport: http (ZERODEV_RPC)
    })
    const kernelClient = createKernelAccountClient({
        account: account,
        chain: chain,
        client: publicClient,
        bundlerTransport: http(ZERODEV_RPC),
        paymaster: {
            getPaymasterData: (userOperation) => {
                return paymasterClient.sponsorUserOperation({userOperation})
            }
        }
    })
    // console.log("HEllo");

    // Migration

    const txHash = await kernelClient.sendTransaction({
        to: zeroAddress,
        value: BigInt(0),
        data: "0x"
    })
    console.log("Transaction hash: ", txHash)
    const kernelVersion = await getKernelVersion(publicClient, {
        address: account.address
    })
    console.log("Kernel version: ", kernelVersion);
    
    const migrationKernelVersion = KERNEL_V3_1;
    const migrationAccount = await createEcdsaKernelMigrationAccount(publicClient, {
        entryPoint,
        signer,
        migrationVersion: {
            from: originalKernelVersion,
            to: migrationKernelVersion
        }
    })

    const migrationKernelClient = createKernelAccountClient({
        account: migrationAccount,
        chain,
        bundlerTransport: http(ZERODEV_RPC),
        client: publicClient,
        paymaster:{

            getPaymasterData: (userOperation)=>{
                return paymasterClient.sponsorUserOperation({userOperation})
            }
        }
    })

    const migrationTxHash = await migrationKernelClient.sendTransaction({
        to: zeroAddress,
        value: BigInt(0),
        data: "0x"
    })
    console.log("Migration transaction hash: ", migrationTxHash);

    const newKernelVersion = await getKernelVersion(publicClient, {
        address: account.address,
    })

    console.log("Migration kernel version: ", newKernelVersion);
}

main()