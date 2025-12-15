import Web3 from 'web3'
import fs from 'fs'
import path from 'path'
import { Contract, ContractSendMethod, Options } from 'web3-eth-contract'

/**
 * Deploy the given contract using Truffle/Ganache build artifacts
 */
export const deploy = async (contractName: string, args: Array<any> = [], from?: string, gas?: number): Promise<Options> => {
  const rpc = process.env.RPC_URL || 'http://127.0.0.1:8545'
  const web3 = new Web3(rpc)
  console.log(`deploying ${contractName}`)
  const artifactsPath = path.join(__dirname, '..', 'build', 'contracts', `${contractName}.json`)
  if (!fs.existsSync(artifactsPath)) throw new Error(`Artifact not found: ${artifactsPath}. Please run 'npx truffle compile'.`)
  const metadata = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'))

  const accounts = await web3.eth.getAccounts()

  const contract: Contract = new web3.eth.Contract(metadata.abi as any)

  const contractSend: ContractSendMethod = contract.deploy({
    data: metadata.bytecode,
    arguments: args
  })

  const newContractInstance = await contractSend.send({
    from: from || accounts[0],
    gas: gas || 1500000
  })
  return newContractInstance.options
}