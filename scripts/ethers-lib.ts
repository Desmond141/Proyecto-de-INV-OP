import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'

/**
 * Deploy the given contract using local Truffle/Ganache build artifacts
 * Expects compiled artifacts in `build/contracts/<Contract>.json` and a JSON-RPC
 * node running at `process.env.RPC_URL` or `http://127.0.0.1:8545` (Ganache).
 */
export const deploy = async (contractName: string, args: Array<any> = [], accountIndex?: number): Promise<ethers.Contract> => {
  console.log(`deploying ${contractName}`)
  const artifactsPath = path.join(__dirname, '..', 'build', 'contracts', `${contractName}.json`)
  if (!fs.existsSync(artifactsPath)) throw new Error(`Artifact not found: ${artifactsPath}. Please run 'npx truffle compile'.`)
  const metadata = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'))

  const rpc = process.env.RPC_URL || 'http://127.0.0.1:8545'
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  const signer = provider.getSigner(accountIndex || 0)

  const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, signer)
  const contract = await factory.deploy(...args)
  await contract.deployed()
  return contract
}