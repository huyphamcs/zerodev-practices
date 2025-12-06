import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { getKernelClient } from "../utils"
import { sepolia } from "viem/chains";
import { zeroAddress } from "viem";

const main = async () => {
    const utilClients = await getKernelClient("0.7", KERNEL_V3_1);
    const kernelClient = utilClients.kernelClient;
    const paymasterClient = utilClients.paymasterClient;
    const txHash = await kernelClient.sendTransaction({
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",


    })
    console.log("Transaction hash: ", txHash);
    
}
main()