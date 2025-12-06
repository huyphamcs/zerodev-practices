import "dotenv/config"
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import {
  http,
  createPublicClient,
  Address,
  decodeEventLog,
  parseAbi,
  encodeFunctionData,
} from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import {
  entryPoint07Address,
  EntryPointVersion,
} from "viem/account-abstraction"

// Your deployed IdentifierEmitter contract address
const IDENTIFIER_EMITTER_ADDRESS = "0x984dc1d1b5953c9430c42429e3cda6c82c94a719" as Address



const chain = sepolia
const publicClient = createPublicClient({
  transport: http(process.env.ZERODEV_RPC),
  chain,
})

const signer = privateKeyToAccount(
  generatePrivateKey()
)
const entryPoint = {
  address: entryPoint07Address as Address,
  version: "0.7" as EntryPointVersion,
}
const kernelVersion = KERNEL_V3_1
const identifierEmitterAbi = parseAbi([
  "event IdentifierEmitted(bytes id, address indexed kernel)",
  "function emitIdentifier(bytes calldata id) external",
])

const main = async () => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  })

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
  })
  console.log("My account:", account.address)

  const paymasterClient = createZeroDevPaymasterClient({
    chain,
    transport: http(process.env.ZERODEV_RPC),
  })
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient,
    paymaster: {
      getPaymasterData: (userOperation) => {
        return paymasterClient.sponsorUserOperation({
          userOperation,
        })
      }
    },
  })

  // Encode the call to emitIdentifier with your custom identifier
  const identifier = "0xb33f" // Your custom identifier
  const callData = encodeFunctionData({
    abi: identifierEmitterAbi,
    functionName: "emitIdentifier",
    args: [identifier],
  })

  const userOpHash = await kernelClient.sendUserOperation({
    callData: await account.encodeCalls([
      {
        to: IDENTIFIER_EMITTER_ADDRESS,
        value: BigInt(0),
        data: callData,
      },
    ]),
  })

  console.log("userOp hash:", userOpHash)

  const _receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })
  console.log({ txHash: _receipt.receipt.transactionHash })

  for (const log of _receipt.logs) {
    try {
      const event = decodeEventLog({
        abi: identifierEmitterAbi,
        ...log,
      })
      if (event.eventName === "IdentifierEmitted") {
        console.log({ id: event.args.id, kernel: event.args.kernel })
      }
    } catch { }
  }
  console.log("userOp completed")
}

main()