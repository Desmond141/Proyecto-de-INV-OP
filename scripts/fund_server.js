#!/usr/bin/env node
const express = require('express')
const bodyParser = require('body-parser')
const Web3 = require('web3')
require('dotenv').config()

const app = express()
const port = Number(process.env.FUND_SERVER_PORT) || 3001
const initialRpc = process.env.GANACHE_RPC || 'http://127.0.0.1:7545'
const secret = process.env.FUND_SECRET || null

// Ensure Node has async/await support
const nodeMajor = Number(process.version.replace(/^v/, '').split('.')[0])
if (Number.isNaN(nodeMajor) || nodeMajor < 8) {
  console.error(`Node ${process.version} is too old. Please use Node.js >= 8 (recommended >= 16).`)
  process.exit(1)
}
console.log(`Node ${process.version} detected; starting fund-server with initial RPC ${initialRpc}`)

app.use(bodyParser.json())
app.use((req, res, next) => {
  // very light CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  next()
})

// Lightweight logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

let usedRpc = initialRpc
let web3 = new Web3(usedRpc)
const net = require('net')

async function findWorkingRpc() {
  const candidates = [initialRpc, 'http://127.0.0.1:7545', 'http://127.0.0.1:8546', 'http://127.0.0.1:8545'] // Puerto 7545 es el por defecto de Ganache GUI
  for (const c of candidates) {
    if (!c) continue
    console.log('Testing RPC candidate', c)
    try {
      const tmp = new Web3(c)
      const accs = await tmp.eth.getAccounts()
      if (accs && accs.length > 0) {
        usedRpc = c
        web3 = tmp
        console.log(`Connected to Ganache RPC at ${c} (accounts: ${accs.length})`)
        return true
      }
    } catch (e) {
      // ignore and try next
    }
  }
  console.warn('No working Ganache RPC found on known ports (7545, 8546, 8545)')
  return false
}

function getAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve) => {
    let i = 0
    const startPortNum = Number(startPort)
    const tryPort = () => {
      const p = startPortNum + i
      const tester = net.createServer()
      tester.once('error', () => {
        tester.close()
        i++
        if (i >= maxAttempts) resolve(null)
        else tryPort()
      })
      tester.once('listening', () => {
        tester.close()
        resolve(p)
      })
      tester.listen(p, '127.0.0.1')
    }
    tryPort()
  })
}

app.get('/health', async (req, res) => {
  try {
    const version = await (web3.eth.getNodeInfo ? web3.eth.getNodeInfo() : Promise.resolve('unknown'))
    const accounts = await web3.eth.getAccounts()
    res.json({ ok: true, initialRpc: initialRpc, rpc: usedRpc, accounts: accounts.length, node: version })
  } catch (e) {
    res.status(502).json({ ok: false, initialRpc: initialRpc, rpc: usedRpc, error: e.message || e.toString() })
  }
})

// Endpoint para obtener la lista de cuentas disponibles
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts()
    const accountsWithBalance = await Promise.all(
      accounts.map(async (addr, index) => {
        const balance = await web3.eth.getBalance(addr)
        return {
          address: addr,
          index: index,
          balance: web3.utils.fromWei(balance, 'ether')
        }
      })
    )
    res.json({ ok: true, accounts: accountsWithBalance })
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message || e.toString() })
  }
})

// Simple HTML UI for manual testing from a browser
app.get('/', async (req, res) => {
  const health = await (async () => {
    try {
      const accounts = await web3.eth.getAccounts()
      return { ok: true, accounts: accounts.length }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  })()
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Fund Server</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; max-width: 800px; }
      label { display: block; margin-top: 1rem; font-weight: bold; }
      input, select { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
      button { margin-top: 1rem; padding: 0.75rem 1.5rem; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 1rem; }
      button:hover { background: #45a049; }
      button:disabled { background: #cccccc; cursor: not-allowed; }
      #refreshAccounts { background: #2196F3; margin-left: 0.5rem; padding: 0.5rem 1rem; }
      #refreshAccounts:hover { background: #0b7dda; }
      pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
      .status { padding: 0.5rem; margin: 1rem 0; border-radius: 4px; }
      .status.success { background: #d4edda; color: #155724; }
      .status.error { background: #f8d7da; color: #721c24; }
      .info { background: #d1ecf1; color: #0c5460; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    </style>
  </head>
  <body>
    <h2>Fund Server - Ganache Account Selector</h2>
    <div class="info">
      <p><strong>RPC:</strong> ${usedRpc}</p>
      <p><strong>Estado:</strong> ${health.ok ? '✓ Conectado con ' + health.accounts + ' cuentas' : '✗ Sin conexión: ' + health.error}</p>
      <p><strong>Puerto del servidor:</strong> ${app.locals.serverPort || port}</p>
    </div>
    
    <label>Seleccionar cuenta de Ganache:</label>
    <div style="display: flex; align-items: center;">
      <select id="accountSelect" style="flex: 1;">
        <option value="">Cargando cuentas...</option>
      </select>
      <button id="refreshAccounts" onclick="loadAccounts()">🔄 Actualizar</button>
    </div>
    <div id="accountInfo" style="margin-top: 0.5rem; font-size: 0.9em; color: #666;"></div>
    
    <label>Dirección destino:</label>
    <input id="target" type="text" placeholder="0x..." style="width: 100%;" />
    
    <label>Cantidad (ETH):</label>
    <input id="amount" type="number" value="1" step="0.1" min="0" />
    
    <label>Server secret (opcional):</label>
    <input id="secret" type="password" placeholder="Si el servidor usa FUND_SECRET" />
    
    <button id="send" onclick="sendFunds()">Enviar ETH</button>
    
    <div id="status"></div>
    <pre id="out"></pre>
    
    <script>
      let accountsList = []
      
      async function loadAccounts() {
        const select = document.getElementById('accountSelect')
        const info = document.getElementById('accountInfo')
        const sendBtn = document.getElementById('send')
        
        try {
          select.innerHTML = '<option value="">Cargando...</option>'
          sendBtn.disabled = true
          
          const res = await fetch('/accounts')
          const data = await res.json()
          
          if (data.ok && data.accounts && data.accounts.length > 0) {
            accountsList = data.accounts
            select.innerHTML = ''
            
            data.accounts.forEach((acc, idx) => {
              const option = document.createElement('option')
              option.value = acc.address
              option.textContent = \`Cuenta #\${acc.index}: \${acc.address.substring(0, 10)}... (\${parseFloat(acc.balance).toFixed(4)} ETH)\`
              select.appendChild(option)
            })
            
            // Seleccionar la primera cuenta por defecto
            select.value = data.accounts[0].address
            updateAccountInfo()
            sendBtn.disabled = false
          } else {
            select.innerHTML = '<option value="">No hay cuentas disponibles</option>'
            info.textContent = 'No se encontraron cuentas en Ganache'
            sendBtn.disabled = true
          }
        } catch (err) {
          select.innerHTML = '<option value="">Error al cargar cuentas</option>'
          info.textContent = 'Error: ' + err.message
          sendBtn.disabled = true
        }
      }
      
      function updateAccountInfo() {
        const select = document.getElementById('accountSelect')
        const info = document.getElementById('accountInfo')
        const selectedAddress = select.value
        
        if (selectedAddress) {
          const account = accountsList.find(acc => acc.address === selectedAddress)
          if (account) {
            info.innerHTML = \`<strong>Cuenta seleccionada:</strong> \${account.address}<br>
                              <strong>Balance:</strong> \${parseFloat(account.balance).toFixed(4)} ETH\`
          }
        } else {
          info.textContent = ''
        }
      }
      
      async function sendFunds() {
        const select = document.getElementById('accountSelect')
        const target = document.getElementById('target').value
        const amount = document.getElementById('amount').value
        const secret = document.getElementById('secret').value
        const statusDiv = document.getElementById('status')
        const outDiv = document.getElementById('out')
        const sendBtn = document.getElementById('send')
        
        const fromAccount = select.value
        
        if (!fromAccount) {
          statusDiv.innerHTML = '<div class="status error">Por favor selecciona una cuenta de Ganache</div>'
          return
        }
        
        if (!target) {
          statusDiv.innerHTML = '<div class="status error">Por favor ingresa una dirección destino</div>'
          return
        }
        
        if (!amount || parseFloat(amount) <= 0) {
          statusDiv.innerHTML = '<div class="status error">Por favor ingresa una cantidad válida</div>'
          return
        }
        
        sendBtn.disabled = true
        statusDiv.innerHTML = '<div class="status">Enviando transacción...</div>'
        outDiv.textContent = ''
        
        try {
          const headers = { 'Content-Type': 'application/json' }
          if (secret) headers['Authorization'] = 'Bearer ' + secret
          
          const res = await fetch('/fund', {
            method: 'POST',
            headers,
            body: JSON.stringify({ target, amount, fromAccount })
          })
          
          const json = await res.json()
          
          if (res.ok) {
            statusDiv.innerHTML = '<div class="status success">✓ Transacción enviada exitosamente</div>'
            outDiv.textContent = JSON.stringify(json, null, 2)
            // Recargar cuentas para actualizar balances
            setTimeout(loadAccounts, 1000)
          } else {
            statusDiv.innerHTML = '<div class="status error">✗ Error: ' + (json.error || 'Error desconocido') + '</div>'
            outDiv.textContent = JSON.stringify(json, null, 2)
          }
        } catch (err) {
          statusDiv.innerHTML = '<div class="status error">✗ Error de conexión: ' + err.message + '</div>'
          outDiv.textContent = 'Error: ' + err.message
        } finally {
          sendBtn.disabled = false
        }
      }
      
      // Cargar cuentas al iniciar
      document.addEventListener('DOMContentLoaded', loadAccounts)
      
      // Actualizar info cuando cambia la selección
      document.getElementById('accountSelect').addEventListener('change', updateAccountInfo)
    </script>
  </body>
  </html>`
  res.setHeader('Content-Type', 'text/html')
  res.send(html)
})

app.post('/fund', async (req, res) => {
  try {
    if (secret) {
      const auth = req.headers['authorization']
      if (!auth || auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'unauthorized' })
      }
    }
    const { target, amount = '1', fromAccount } = req.body || {}
    if (!target) return res.status(400).json({ error: 'target required' })
    const accounts = await web3.eth.getAccounts()
    if (!accounts || accounts.length === 0) throw new Error('no ganache accounts available')
    
    // Usar la cuenta seleccionada o la primera por defecto
    let from = accounts[0]
    if (fromAccount) {
      // Validar que la cuenta seleccionada existe en la lista
      if (accounts.includes(fromAccount)) {
        from = fromAccount
      } else {
        return res.status(400).json({ error: 'selected account not found in Ganache accounts' })
      }
    }
    
    const value = web3.utils.toWei(amount.toString(), 'ether')
    const tx = await web3.eth.sendTransaction({ from, to: target, value })
    return res.json({ 
      txHash: tx.transactionHash, 
      from, 
      to: target, 
      amount: amount,
      value: value.toString(),
      valueWei: value.toString()
    })
  } catch (err) {
    console.error('fund error', err)
    return res.status(500).json({ error: err.message || err.toString() })
  }
})

;(async function startServer() {
  await findWorkingRpc()
  const p = await getAvailablePort(port, 12)
  const chosenPort = p || port
  if (chosenPort !== port) console.warn(`Port ${port} busy -> using fallback port ${chosenPort}`)
  const server = app.listen(chosenPort, async () => {
    console.log(`Fund server listening on http://127.0.0.1:${chosenPort}`)
    app.locals.serverPort = chosenPort
    try {
      const accs = await web3.eth.getAccounts()
      console.log('Ganache accounts count:', accs.length)
    } catch (e) {
      console.log('Unable to list Ganache accounts on RPC', usedRpc, e.message)
    }
  })
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${chosenPort} is in use. If you want to free it use: netstat -ano | findstr ${chosenPort} and then kill the PID (taskkill /PID <pid> /F)`)
    } else {
      console.error('Server error:', err.message)
    }
  })
})()
