const fs = require('fs')
const path = require('path')

function main() {
  const artifactPath = path.join(__dirname, '..', 'build', 'contracts', 'P2PPay.json')
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found. Run `npx truffle compile` or `npx truffle migrate --network ganache` first.')
    process.exit(1)
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
  const networks = artifact.networks || {}
  const networkIds = Object.keys(networks)
  if (networkIds.length === 0) {
    console.error('No deployed networks found in artifact. Please run migrations.')
    process.exit(1)
  }
  // Prefer the latest network id (highest numeric value) to capture the most recent deployment
  function parseNetworkId(id) { return Number(id) || 0 }
  const deployedNetworkId = networkIds.sort((a, b) => parseNetworkId(b) - parseNetworkId(a))[0]
  const deployedInfo = networks[deployedNetworkId]
  const frontendObj = {
    address: deployedInfo.address,
    abi: artifact.abi,
    networkId: deployedNetworkId,
    // Allow exporting a project wallet address via environment variable so frontend can autofill funding targets
    projectWallet: process.env.PROJECT_WALLET || null
  }
  const outPath = path.join(__dirname, '..', 'frontend', 'p2ppay.json')
  fs.writeFileSync(outPath, JSON.stringify(frontendObj, null, 2))
  console.log('Wrote frontend artifact to', outPath)
}

main()
