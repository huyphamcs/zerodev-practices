import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { getKernelClient, getReceiptFromUserOpHash } from "../utils";
import { createZeroDevPaymasterClient, gasTokenAddresses, getERC20PaymasterApproveCall } from "@zerodev/sdk";
import { sepolia } from "viem/chains";
import { parseEther, zeroAddress } from "viem";
import { getUserOperationHash } from "viem/_types/account-abstraction";
const chain = sepolia
const main = async () => {
    const utilClients = await getKernelClient("0.7", KERNEL_V3_1);
    const kernelClient = utilClients.kernelClient;
    const paymasterClient = utilClients.paymasterClient;
    const entryPoint = utilClients.entryPoint;
    const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls([
            await getERC20PaymasterApproveCall(paymasterClient,{
                gasToken: gasTokenAddresses[chain.id]["USDC"],
                approveAmount: parseEther("1"),
                entryPoint,
            }),

            {
                to: zeroAddress,
                value: BigInt(0),
                data: "0x"
            }
        ])
    });
    console.log("User operation: ", userOpHash);
    const receipt = await getReceiptFromUserOpHash(kernelClient, userOpHash);
    console.log("UserOp completed", receipt.receipt.transactionHash);
}
main()