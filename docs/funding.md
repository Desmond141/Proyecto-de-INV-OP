# Fund Wallets for Local Testing

This document explains how to fund a MetaMask account and the project wallet from Ganache for local testing.

## Start Ganache

**IMPORTANTE**: Este proyecto usa el puerto **8546** de forma unificada para Ganache. Esto coincide con la configuración de Truffle en `truffle-config.js`.

Para iniciar Ganache:

```bash
npm run start-ganache
```

Esto iniciará Ganache en el puerto **8546**.

**Nota sobre otros puertos**: Si necesitas usar otro puerto (por ejemplo, si usas Ganache GUI que típicamente usa 7545), puedes:
1. Configurar `GANACHE_RPC` en tu archivo `.env`
2. El fund-server buscará automáticamente en los puertos: 8546, 7545, 8545

Note: This project expects Node.js 8+ to run the local fund server — using Node 16+ is recommended. Verify your Node version with `node -v`.

## Fill MetaMask using a Ganache account private key (recommended)
1. Open Ganache and copy a private key of one of the pre-funded accounts (Account #0).
2. In MetaMask, `Import Account` and paste the private key. Select the Ganache network RPC (`http://127.0.0.1:8546`) in MetaMask.
3. The imported MetaMask account will show the ETH balance.

## Fund a MetaMask account using the UI + fund server (no private key needed)

1. Start the fund server:

```bash
# from project root
# If your Ganache RPC is on a non-default port (7545/8545/8546), set GANACHE_RPC
# Example (PowerShell):
$env:GANACHE_RPC='http://127.0.0.1:7545'
npm run fund-server
```

You can optionally secure the server locally by setting:

```bash
# example (PowerShell)
$env:FUND_SECRET='mysecret'
npm run fund-server
```

2. Iniciar la UI:
```bash
npm run ui
```

3. Open the UI (`http://127.0.0.1:8080`) and connect MetaMask to the Ganache network.
3. Click `Fundear mi cuenta (Ganache)` and confirm in the UI. The server will transfer ETH from Ganache account 0 to the connected MetaMask address.

Note: The fund server uses accounts from Ganache by calling JSON-RPC `eth_sendTransaction` with the first account in the Ganache list; the account must be unlocked by Ganache (default) and Ganache must be running against the RPC configured in `scripts/fund_server.js`.

### Troubleshooting connectivity

- If the fund server prints `Unable to list Ganache accounts on RPC http://127.0.0.1:XXXX`, then the RPC is not reachable.
- Confirm the RPC port in Ganache GUI or start Ganache CLI with the correct port (examples above).
- Test RPC reachability with PowerShell:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 7545
```

- Test the RPC client JSON call:

```powershell
curl -X POST http://127.0.0.1:7545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"web3_clientVersion","params":[]}'
```

If the RPC connection is refused, start Ganache on that port or use the correct `GANACHE_RPC` env variable when starting `npm run fund-server`.

### Port 3001 busy (EADDRINUSE)

If you get `EADDRINUSE` or `Port 3001 is in use` when starting the fund server, either:

- Kill the process currently using port 3001 (PowerShell):

```powershell
$pid = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
Stop-Process -Id $pid -Force
```

- Or start the server on a different port, for example 3002:

```powershell
$env:FUND_SERVER_PORT='3002'
npm run fund-server
```

The fund server will try to fall back to another free port if 3001 is occupied, and logs which port it ended up using.

## Fund the Project Wallet via UI
- Use the 'Fundar Wallet del Proyecto' button in the UI — this calls the `payTo` method of the P2PPay contract using the connected MetaMask account and sends funds to the project's wallet via on-chain transfer.

## Truffle CLI fund option
You can also fund from the terminal using Truffle's `fund` script:

```bash
# fund a target address with 1 ETH
npm run fund -- 0xYourAddressHere 1
```

If you have any questions or want me to add an endpoint that supports authorisation or returns transaction hashes in the UI, tell me and I can extend the server and the frontend behavior.
