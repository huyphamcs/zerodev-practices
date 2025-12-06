import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { getKernelClient } from "../utils"
import { sepolia } from "viem/chains";
import { zeroAddress } from "viem";

const main = async () => {
    const utilClients = await getKernelClient("0.7", KERNEL_V3_1);
    const kernelClient = utilClients.kernelClient;
    const paymasterClient = utilClients.paymasterClient;
    const userOpHash = await kernelClient.sendUserOperation({
        callData: await utilClients.account.encodeCalls([
            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x",
            }
        ])
    })
    console.log("User operation hash: ", userOpHash);
    const result = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash
    })
    console.log("Result: ", result);
}
main()