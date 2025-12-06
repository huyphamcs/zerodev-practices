import { KERNEL_IMPLEMENTATION_SLOT, KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { getKernelClient } from "../utils"
import { getCustomNonceKeyFromString } from "@zerodev/sdk";
import { bytesToBigInt, zeroAddress } from "viem";


const main = async () => {
    const utilClients = await getKernelClient("0.7", KERNEL_V3_1);
    const kernelClient = utilClients.kernelClient;
    const entryPoint = utilClients.entryPoint;
    const customNonceKey1 = getCustomNonceKeyFromString(
        "Nonce 1",
        "0.7"
    );
    const customNonceKey2 = getCustomNonceKeyFromString(
        "Nonce 2",
        "0.7"
    );

    const nonce1 = await kernelClient.account.getNonce({ key: customNonceKey1 });
    const nonce2 = await kernelClient.account.getNonce({ key: customNonceKey2 });

    const [userOpHash1, userOpHash2] = await Promise.all([
        kernelClient.sendUserOperation({
            callData: await kernelClient.account.encodeCalls([
                {
                    to: zeroAddress,
                    value: BigInt(0),
                    data: "0x",
                },
            ]),
            nonce: nonce1,
        }),
        kernelClient.sendUserOperation({
            callData: await kernelClient.account.encodeCalls([
                {
                    to: zeroAddress,
                    value: BigInt(0),
                    data: "0x",
                },
            ]),
            nonce: nonce2,
        }),
    ]);

    console.log("UserOp1 hash:", userOpHash1);
    console.log("UserOp2 hash:", userOpHash2);
    console.log("Waiting for UserOp to complete...");

    await Promise.all([
        kernelClient.waitForUserOperationReceipt({ hash: userOpHash1 }),
        kernelClient.waitForUserOperationReceipt({ hash: userOpHash2 }),
    ]);

    console.log("UserOp completed");
}
main()