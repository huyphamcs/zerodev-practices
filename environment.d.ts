declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ZERODEV_RPC: string,
        }
    }
}
export { }; // Important for making this a module