import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { createKernelAccount, verifyEIP6492Signature } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import "dotenv/config"
import { createPublicClient, hashMessage, http } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"

const chain = sepolia
const ZERODEV_RPC = process.env.ZERODEV_RPC
const entryPoint = getEntryPoint("0.7");
const kernelVersion = KERNEL_V3_1;
const privateKey = generatePrivateKey();
const signer = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
    chain,
    transport: http(ZERODEV_RPC)
})


const main = async () => {

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion
    })
    const account = await createKernelAccount(publicClient, {
        plugins:{
            sudo: ecdsaValidator
        },
        entryPoint,
        kernelVersion
    })
    const signature = await account.signMessage({
        message: "Hello World",
    })
    // console.log(signature);
    console.log(
        await verifyEIP6492Signature({
            signer: account.address,
            hash: hashMessage("Hello World"),
            signature: signature,
            client: publicClient
        })
    )


    // Expected to be false
    console.log(
        await verifyEIP6492Signature({
            signer: account.address,
            hash: hashMessage("Hello Anderson"),
            signature: signature,
            client: publicClient
        })
    )
}
main()