import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { getKernelClient } from "../utils";
import { zeroAddress } from "viem";
import { GreeterAbi, GreeterBytecode } from "./Greeter";


const main = async () => {
    const kernelClient = await getKernelClient("0.7", KERNEL_V3_1);

    const txHash = await kernelClient.sendTransaction({
        callData: await kernelClient.account.encodeDeployCallData({
            abi: GreeterAbi,
            bytecode: GreeterBytecode
        })
    })
    console.log(txHash);
}
main()