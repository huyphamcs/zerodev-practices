import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { getKernelClient } from "../utils"
import { zeroAddress } from "viem";
import { gasTokenAddresses } from "@zerodev/sdk";
import { sepolia } from "viem/chains";


const chain = sepolia;

const main = async () => {
    const utilClients = await getKernelClient("0.7", KERNEL_V3_1);
    const kernelClient = utilClients.kernelClient
    const account = utilClients.account
    const paymasterClient = utilClients.paymasterClient;
    const entryPoint = utilClients.entryPoint;
    const userOperation = await kernelClient.prepareUserOperation({
        callData: await account.encodeCalls([
            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x"
            }
        ])
    })

    const result = await paymasterClient.estimateGasInERC20({
        userOperation,
        gasTokenAddress: gasTokenAddresses[chain.id]["USDC"],
        entryPoint: entryPoint.address
    })
    console.log("estimated fee: ", result);
}
main()