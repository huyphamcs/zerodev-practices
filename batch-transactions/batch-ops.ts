
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import {getKernelClient} from "../utils"
import { zeroAddress } from "viem";


const main = async () => {
    const kernelClient = (await getKernelClient("0.7", KERNEL_V3_1)).kernelClient;

    const txHash = await kernelClient.sendUserOperation({
        calls:[
            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x"
            },
            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x"
            }
        ]
    })
    console.log(txHash);
}
main()