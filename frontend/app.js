// P2P Pay Application - Main JavaScript
// Estado global de la aplicación
const AppState = {
  currentAccount: null,
  currentProvider: null,
  currentSigner: null,
  contractInfo: null,
  accounts: [],
  accountSources: [], // Guardar fuente de cada cuenta (MetaMask, Ganache, etc.)
  currentView: 'login',
  rpcProvider: null // Provider del RPC local
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await initApp()
})

async function initApp() {
  // Configurar navegación
  setupNavigation()
  
  // Configurar eventos de botones
  setupEventListeners()
  
  // Configurar botón para establecer contrato manualmente
  const btnSetContract = document.getElementById('btnSetContract')
  if (btnSetContract) {
    btnSetContract.addEventListener('click', handleSetContract)
  }
  
  // Cargar información del contrato
  await loadContractInfo()
  
  // Verificar si ya hay una cuenta conectada
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        await connectWallet()
      }
    } catch (e) {
      console.log('No hay cuenta conectada previamente')
    }
  }
  
  // Escuchar cambios de cuenta en MetaMask
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', () => window.location.reload())
  }
}

// Configurar navegación
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn')
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view')
      switchView(view)
    })
  })
}

// Cambiar de vista
function switchView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active')
  })
  
  // Mostrar la vista seleccionada
  const targetView = document.getElementById(`${viewName}View`)
  if (targetView) {
    targetView.classList.add('active')
    AppState.currentView = viewName
  }
  
  // Actualizar botones de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })
  
  // Cargar datos según la vista
  if (viewName === 'wallet') {
    loadWalletView()
  } else if (viewName === 'p2p') {
    loadP2PView()
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Login
  document.getElementById('btnLogin').addEventListener('click', connectWallet)
  document.getElementById('accountSelect').addEventListener('change', handleAccountChange)
  
  // Wallet actions
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.getAttribute('data-action')
      handleWalletAction(action)
    })
  })
  
  // Send
  document.getElementById('btnSend').addEventListener('click', handleSend)
  document.getElementById('btnCancelSend').addEventListener('click', () => hideSubview('send'))
  
  // Receive
  document.getElementById('btnCopyAddress').addEventListener('click', copyAddress)
  document.getElementById('btnCancelReceive').addEventListener('click', () => hideSubview('receive'))
  
  // Withdraw
  document.getElementById('btnWithdraw').addEventListener('click', handleWithdraw)
  document.getElementById('btnCancelWithdraw').addEventListener('click', () => hideSubview('withdraw'))
  
  // P2P
  document.getElementById('p2pAccount1').addEventListener('change', (e) => updateP2PUser(1, e.target.value))
  document.getElementById('p2pAccount2').addEventListener('change', (e) => updateP2PUser(2, e.target.value))
  document.getElementById('btnP2PSend').addEventListener('click', handleP2PSend)
}

// Cargar información del contrato desde múltiples fuentes
async function loadContractInfo() {
  try {
    let contractInfo = null
    
    // 1. Intentar desde parámetros de URL (máxima prioridad)
    const urlParams = new URLSearchParams(window.location.search)
    const contractAddress = urlParams.get('contract') || urlParams.get('address')
    if (contractAddress && ethers.utils.isAddress(contractAddress)) {
      console.log('📋 Dirección del contrato desde URL:', contractAddress)
      // Intentar obtener ABI desde build artifact
      try {
        const buildRes = await fetch('/build/contracts/P2PPay.json')
        if (buildRes.ok) {
          const buildData = await buildRes.json()
          contractInfo = {
            address: contractAddress,
            abi: buildData.abi,
            networkId: null,
            projectWallet: null
          }
          console.log('✅ Contrato cargado desde URL + build artifact')
        }
      } catch (e) {
        console.warn('No se pudo cargar ABI desde build artifact, usando ABI por defecto')
        // Usar ABI básico si no se puede cargar desde build
        contractInfo = {
          address: contractAddress,
          abi: getDefaultABI(),
          networkId: null,
          projectWallet: null
        }
      }
    }
    
    // 2. Intentar desde localStorage (si se guardó previamente)
    if (!contractInfo) {
      try {
        const saved = localStorage.getItem('p2ppay_contract_info')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.address && ethers.utils.isAddress(parsed.address)) {
            contractInfo = parsed
            console.log('✅ Contrato cargado desde localStorage:', contractInfo.address)
          }
        }
      } catch (e) {
        console.debug('No hay contrato guardado en localStorage')
      }
    }
    
    // 3. Intentar desde p2ppay.json (ubicación estándar)
    if (!contractInfo) {
      try {
        const res = await fetch('/p2ppay.json')
        if (res.ok) {
          contractInfo = await res.json()
          console.log('✅ Contrato cargado desde p2ppay.json:', contractInfo.address)
          // Guardar en localStorage para futuras cargas
          try {
            localStorage.setItem('p2ppay_contract_info', JSON.stringify(contractInfo))
          } catch (e) {
            console.debug('No se pudo guardar en localStorage')
          }
        }
      } catch (err) {
        console.debug('No se pudo cargar desde p2ppay.json:', err.message)
      }
    }
    
    // 4. Intentar desde build/contracts/P2PPay.json (artifact de Truffle)
    if (!contractInfo) {
      try {
        const buildRes = await fetch('/build/contracts/P2PPay.json')
        if (buildRes.ok) {
          const buildData = await buildRes.json()
          const networks = buildData.networks || {}
          
          // Buscar el deployment más reciente
          const networkKeys = Object.keys(networks)
          if (networkKeys.length > 0) {
            // Ordenar por networkId (más reciente primero)
            const sortedNetworks = networkKeys
              .map(key => ({ key, network: networks[key] }))
              .filter(n => n.network && n.network.address)
              .sort((a, b) => {
                const idA = parseInt(a.key) || 0
                const idB = parseInt(b.key) || 0
                return idB - idA
              })
            
            if (sortedNetworks.length > 0) {
              const latest = sortedNetworks[0]
              contractInfo = {
                address: latest.network.address,
                abi: buildData.abi,
                networkId: latest.key,
                projectWallet: null
              }
              console.log('✅ Contrato cargado desde build artifact:', contractInfo.address)
              // Guardar en localStorage
              try {
                localStorage.setItem('p2ppay_contract_info', JSON.stringify(contractInfo))
              } catch (e) {
                console.debug('No se pudo guardar en localStorage')
              }
            }
          }
        }
      } catch (err) {
        console.debug('No se pudo cargar desde build artifact:', err.message)
      }
    }
    
    // 5. Si aún no hay contrato, intentar detectar desde el provider conectado
    if (!contractInfo && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = network.chainId.toString()
        
        // Intentar cargar desde build artifact con el chainId actual
        try {
          const buildRes = await fetch('/build/contracts/P2PPay.json')
          if (buildRes.ok) {
            const buildData = await buildRes.json()
            const networks = buildData.networks || {}
            
            // Buscar por chainId
            const networkEntry = Object.values(networks).find(n => 
              n && (String(n.network_id) === chainId || String(n.chainId) === chainId)
            )
            
            if (networkEntry && networkEntry.address) {
              contractInfo = {
                address: networkEntry.address,
                abi: buildData.abi,
                networkId: chainId,
                projectWallet: null
              }
              console.log('✅ Contrato detectado automáticamente desde provider:', contractInfo.address)
              // Guardar en localStorage
              try {
                localStorage.setItem('p2ppay_contract_info', JSON.stringify(contractInfo))
              } catch (e) {
                console.debug('No se pudo guardar en localStorage')
              }
            }
          }
        } catch (e) {
          console.debug('No se pudo detectar desde provider')
        }
      } catch (err) {
        console.debug('No se pudo conectar al provider para detectar contrato')
      }
    }
    
    if (contractInfo && contractInfo.address) {
      AppState.contractInfo = contractInfo
      console.log('✅ Contrato configurado:', contractInfo.address)
      
      // Mostrar información del contrato en la UI si hay un elemento para ello
      const contractInfoEl = document.getElementById('contractInfo')
      if (contractInfoEl) {
        contractInfoEl.innerHTML = `
          <div style="color: #a0d0a0; font-size: 0.85rem;">
            ✅ Contrato detectado: <code style="color: #888;">${contractInfo.address.substring(0, 10)}...${contractInfo.address.substring(contractInfo.address.length - 8)}</code>
          </div>
        `
        contractInfoEl.style.color = '#a0d0a0'
      }
    } else {
      const contractInfoEl = document.getElementById('contractInfo')
      if (contractInfoEl) {
        contractInfoEl.innerHTML = `
          <div style="color: #d0a0a0; font-size: 0.85rem;">
            ⚠️ No se detectó un contrato. Configura uno manualmente o usa: <code style="color: #888;">?contract=0x...</code>
          </div>
        `
        contractInfoEl.style.color = '#d0a0a0'
      }
      throw new Error('No se pudo encontrar información del contrato. Asegúrate de que el contrato esté desplegado o proporciona la dirección en la URL: ?contract=0x...')
    }
    
  } catch (err) {
    console.error('Error al cargar contrato:', err)
    showStatus('loginStatus', `Error: ${err.message}`, 'error')
  }
}

// ABI por defecto del contrato P2PPay (fallback)
function getDefaultABI() {
  return [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "payee", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "indexed": false, "internalType": "bytes32", "name": "ref", "type": "bytes32" }
      ],
      "name": "PaymentRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "payee", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "Withdrawn",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "payee", "type": "address" },
        { "internalType": "bytes32", "name": "ref", "type": "bytes32" }
      ],
      "name": "payTo",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "who", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ]
}

// Conectar wallet
async function connectWallet() {
  try {
    showStatus('loginStatus', 'Conectando y cargando cuentas...', 'info')
    
    // Primero cargar todas las cuentas disponibles (MetaMask + RPC local)
    await loadAllAccounts()
    
    // Si hay MetaMask disponible, intentar conectar
    if (window.ethereum) {
      try {
        // Solicitar conexión
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Obtener provider y signer
        AppState.currentProvider = new ethers.providers.Web3Provider(window.ethereum)
        AppState.currentSigner = AppState.currentProvider.getSigner()
        AppState.currentAccount = await AppState.currentSigner.getAddress()
      } catch (metaMaskErr) {
        console.warn('Error al conectar MetaMask:', metaMaskErr)
        // Continuar con cuentas del RPC local si MetaMask falla
      }
    }
    
    // Si no hay cuenta de MetaMask pero hay cuentas del RPC, usar la primera
    if (!AppState.currentAccount && AppState.accounts.length > 0) {
      AppState.currentAccount = AppState.accounts[0]
      showStatus('loginStatus', '✅ Cuentas cargadas desde RPC local. Nota: Para realizar transacciones, necesitas importar la cuenta en MetaMask.', 'info')
    } else if (AppState.currentAccount) {
      showStatus('loginStatus', '✅ Conectado exitosamente', 'success')
    } else {
      throw new Error('No se encontraron cuentas. Asegúrate de tener MetaMask conectado o que Ganache esté corriendo.')
    }
    
    // Actualizar UI
    updateUserInfo()
    
    // Cambiar a vista de billetera después de 1 segundo
    setTimeout(() => {
      switchView('wallet')
    }, 1000)
    
  } catch (err) {
    console.error('Error al conectar:', err)
    showStatus('loginStatus', `Error: ${err.message}`, 'error')
  }
}

// Cargar todas las cuentas (MetaMask + RPC Local)
async function loadAllAccounts() {
  try {
    const allAccounts = new Set()
    const accountSources = []
    
    // 1. Intentar obtener cuentas de MetaMask del navegador actual
    if (window.ethereum) {
      try {
        let metamaskAccounts = []
        if (window.P2P && window.P2P.getAllAccounts) {
          metamaskAccounts = await window.P2P.getAllAccounts()
        } else {
          metamaskAccounts = await window.ethereum.request({ method: 'eth_accounts' })
        }
        
        if (metamaskAccounts && metamaskAccounts.length > 0) {
          metamaskAccounts.forEach(acc => {
            allAccounts.add(acc.toLowerCase())
            accountSources.push({ address: acc, source: 'MetaMask' })
          })
          console.log('✅ Cuentas de MetaMask encontradas:', metamaskAccounts.length)
        }
      } catch (e) {
        console.warn('No se pudieron obtener cuentas de MetaMask:', e)
      }
    }
    
    // 2. Obtener cuentas del RPC local (Ganache) - esto funciona independientemente del navegador
    const rpcPorts = [7545, 8546, 8545] // Puerto 7545 es el por defecto de Ganache GUI
    let ganacheAccounts = []
    
    for (const port of rpcPorts) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${port}`)
        // Verificar que el RPC responda
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ])
        
        // Obtener cuentas del RPC
        const accounts = await Promise.race([
          provider.send('eth_accounts', []),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ])
        
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          accounts.forEach(acc => {
            const addr = acc.toLowerCase()
            if (!allAccounts.has(addr)) {
              allAccounts.add(addr)
              ganacheAccounts.push(acc)
              accountSources.push({ address: acc, source: 'Ganache RPC' })
            }
          })
          console.log(`✅ Cuentas de Ganache encontradas en puerto ${port}:`, accounts.length)
          break // Usar el primer puerto que funcione
        }
      } catch (e) {
        console.debug(`RPC en puerto ${port} no disponible o timeout`)
        continue
      }
    }
    
    // 3. Intentar obtener cuentas del fund-server (si está disponible)
    try {
      const fundServerBase = window.fundServerBase || 'http://127.0.0.1:3001'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      
      const res = await fetch(`${fundServerBase}/accounts`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.accounts && Array.isArray(data.accounts)) {
          data.accounts.forEach(acc => {
            const addr = typeof acc === 'string' ? acc : (acc.address || acc)
            const addrLower = addr.toLowerCase()
            if (!allAccounts.has(addrLower)) {
              allAccounts.add(addrLower)
              accountSources.push({ address: addr, source: 'Fund Server' })
            }
          })
          console.log('✅ Cuentas del fund-server encontradas:', data.accounts.length)
        }
      }
    } catch (e) {
      console.debug('Fund-server no disponible:', e.message)
    }
    
    // Convertir Set a Array y guardar
    AppState.accounts = Array.from(allAccounts)
    AppState.accountSources = accountSources // Guardar fuentes para referencia
    
    console.log('📊 Total de cuentas encontradas:', AppState.accounts.length)
    console.log('Fuentes:', accountSources)
    
    // Actualizar selectores de cuentas
    updateAccountSelectors()
    
  } catch (err) {
    console.error('Error al cargar cuentas:', err)
    AppState.accounts = []
  }
}

// Actualizar selectores de cuentas
function updateAccountSelectors() {
  const selectors = [
    document.getElementById('accountSelect'),
    document.getElementById('p2pAccount1'),
    document.getElementById('p2pAccount2')
  ]
  
  selectors.forEach(select => {
    if (!select) return
    
    // Limpiar opciones existentes (excepto la primera)
    while (select.options.length > 1) {
      select.remove(1)
    }
    
    // Agregar cuentas con información de fuente
    AppState.accounts.forEach(account => {
      const option = document.createElement('option')
      option.value = account
      
      // Buscar fuente de la cuenta
      const source = AppState.accountSources.find(s => 
        s.address.toLowerCase() === account.toLowerCase()
      )
      const sourceLabel = source ? ` (${source.source})` : ''
      
      option.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}${sourceLabel}`
      select.appendChild(option)
    })
    
    // Seleccionar cuenta actual si existe
    if (AppState.currentAccount) {
      const currentLower = AppState.currentAccount.toLowerCase()
      const found = AppState.accounts.find(acc => acc.toLowerCase() === currentLower)
      if (found) {
        select.value = found
      }
    }
  })
  
  // Mostrar selector en login si hay cuentas
  if (AppState.accounts.length > 0) {
    document.getElementById('accountSelectorContainer').style.display = 'block'
  }
}

// Manejar cambio de cuenta
async function handleAccountChange(e) {
  const address = e.target.value
  if (!address) return
  
  try {
    // Actualizar cuenta actual
    AppState.currentAccount = address
    
    // Actualizar provider y signer según la fuente de la cuenta
    const accountSource = AppState.accountSources.find(s => 
      s.address.toLowerCase() === address.toLowerCase()
    )
    
    if (accountSource && accountSource.source === 'MetaMask' && window.ethereum) {
      // Es una cuenta de MetaMask
      if (window.P2P && window.P2P.switchAccount) {
        await window.P2P.switchAccount(address)
      }
      AppState.currentProvider = new ethers.providers.Web3Provider(window.ethereum)
      AppState.currentSigner = AppState.currentProvider.getSigner(address)
    } else {
      // Es una cuenta de Ganache RPC o Fund Server
      // Intentar usar RPC local
      const rpcPorts = [7545, 8546, 8545] // Puerto 7545 es el por defecto de Ganache GUI
      for (const port of rpcPorts) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${port}`)
          await Promise.race([
            provider.getBlockNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ])
          AppState.rpcProvider = provider
          AppState.currentProvider = provider
          // Para RPC local, no hay signer a menos que esté en MetaMask
          if (window.ethereum) {
            try {
              AppState.currentSigner = new ethers.providers.Web3Provider(window.ethereum).getSigner(address)
            } catch (e) {
              // Si la cuenta no está en MetaMask, no hay signer disponible
              AppState.currentSigner = null
            }
          } else {
            AppState.currentSigner = null
          }
          break
        } catch (e) {
          continue
        }
      }
    }
    
    updateUserInfo()
    
    if (AppState.currentView === 'wallet') {
      loadWalletView()
    } else if (AppState.currentView === 'p2p') {
      loadP2PView()
    }
    
  } catch (err) {
    console.error('Error al cambiar cuenta:', err)
    showStatus('loginStatus', `Error: ${err.message}`, 'error')
  }
}

// Actualizar información del usuario
function updateUserInfo() {
  if (AppState.currentAccount) {
    document.getElementById('userInfo').style.display = 'flex'
    document.getElementById('userAddress').textContent = 
      `${AppState.currentAccount.substring(0, 6)}...${AppState.currentAccount.substring(AppState.currentAccount.length - 4)}`
  } else {
    document.getElementById('userInfo').style.display = 'none'
  }
}

// Manejar cambio de cuentas en MetaMask
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // Usuario desconectó MetaMask
    AppState.currentAccount = null
    AppState.currentSigner = null
    updateUserInfo()
    switchView('login')
  } else {
    // Usuario cambió de cuenta
    AppState.currentAccount = accounts[0]
    if (AppState.currentProvider) {
      AppState.currentSigner = AppState.currentProvider.getSigner(AppState.currentAccount)
    }
    updateUserInfo()
    loadAllAccounts()
    if (AppState.currentView === 'wallet') {
      loadWalletView()
    }
  }
}

// Cargar vista de billetera
async function loadWalletView() {
  if (!AppState.currentAccount) {
    showStatus('walletStatus', 'Por favor, conecta tu billetera primero', 'error')
    switchView('login')
    return
  }
  
  // Actualizar dirección
  document.getElementById('walletAddress').textContent = AppState.currentAccount
  
  // Cargar balances
  await updateWalletBalances()
}

// Actualizar balances de billetera
async function updateWalletBalances() {
  if (!AppState.currentAccount || !AppState.contractInfo) {
    document.getElementById('walletBalance').textContent = 'No disponible'
    return
  }
  
  try {
    // Asegurarse de que tenemos un provider
    let provider = AppState.currentProvider
    
    if (!provider) {
      // Intentar crear provider desde MetaMask
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        AppState.currentProvider = provider
      } else {
        // Usar RPC local como fallback
        const rpcPorts = [7545, 8546, 8545] // Puerto 7545 es el por defecto de Ganache GUI
        for (const port of rpcPorts) {
          try {
            const testProvider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${port}`)
            await Promise.race([
              testProvider.getBlockNumber(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ])
            provider = testProvider
            AppState.rpcProvider = provider
            AppState.currentProvider = provider
            break
          } catch (e) {
            continue
          }
        }
      }
    }
    
    if (!provider) {
      throw new Error('No se pudo conectar a ningún provider (MetaMask o RPC local)')
    }
    
    // Balance de ETH de la cuenta
    let ethBalance
    let ethBalanceFormatted = '0.0'
    try {
      ethBalance = await Promise.race([
        provider.getBalance(AppState.currentAccount),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout consultando balance de ETH')), 5000))
      ])
      ethBalanceFormatted = ethers.utils.formatEther(ethBalance)
    } catch (ethErr) {
      console.warn('Error al obtener balance de ETH:', ethErr)
      // Continuar con balance de contrato aunque falle el balance de ETH
    }
    
    // Balance en el contrato
    let contractBalance
    let contractBalanceFormatted = '0.0'
    try {
      // Normalizar la dirección del contrato (checksum) antes de usarla
      const contractAddress = ethers.utils.getAddress(AppState.contractInfo.address.toLowerCase())
      
      const contract = new ethers.Contract(
        contractAddress,
        AppState.contractInfo.abi,
        provider
      )
      
      // Verificar la red primero
      let network
      try {
        network = await provider.getNetwork()
        console.log('Red detectada:', network.chainId.toString(), network.name)
        
        // Si está usando MetaMask, verificar que esté en la red correcta (Chain ID 1337 para Ganache)
        if (window.ethereum && provider instanceof ethers.providers.Web3Provider) {
          const chainId = network.chainId.toString()
          if (chainId !== '1337' && chainId !== '0x539' && chainId !== '31337') {
            throw new Error(`MetaMask está conectado a la red incorrecta (Chain ID: ${chainId}). Por favor, cambia a la red Ganache (Chain ID: 1337) en MetaMask.`)
          }
        }
      } catch (networkErr) {
        console.warn('Error al verificar red:', networkErr)
      }
      
      // Verificar que el contrato existe en esta red usando la dirección normalizada
      const code = await Promise.race([
        provider.getCode(contractAddress),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ])
      
      if (code === '0x' || code === '0x0' || !code || code.length <= 2) {
        const networkInfo = network ? ` (Chain ID: ${network.chainId})` : ''
        throw new Error(`El contrato no está desplegado en esta red${networkInfo}. Verifica que MetaMask esté conectado a Ganache (Chain ID: 1337) o ejecuta: npm run build-and-export`)
      }
      
      console.log('✅ Contrato verificado en la red:', contractAddress, 'código encontrado:', code.substring(0, 20) + '...')
      
      // Actualizar la dirección del contrato con el checksum correcto
      AppState.contractInfo.address = contractAddress
      
      contractBalance = await Promise.race([
        contract.balanceOf(AppState.currentAccount),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout consultando balance del contrato')), 10000))
      ])
      contractBalanceFormatted = ethers.utils.formatEther(contractBalance)
    } catch (contractErr) {
      console.error('Error al obtener balance del contrato:', contractErr)
      const errMsg = contractErr.message || contractErr.toString()
      
      if (errMsg.includes('Internal JSON-RPC error') || errMsg.includes('JSON-RPC')) {
        throw new Error('Error de JSON-RPC: Verifica que MetaMask esté conectado a la red correcta (Chain ID: 1337) o que Ganache esté corriendo')
      } else if (errMsg.includes('no está desplegado')) {
        throw contractErr
      } else {
        throw new Error(`Error al consultar balance del contrato: ${errMsg}`)
      }
    }
    
    // Mostrar balance total (ETH + contrato)
    const totalBalance = parseFloat(ethBalanceFormatted) + parseFloat(contractBalanceFormatted)
    document.getElementById('walletBalance').textContent = `${totalBalance.toFixed(4)} ETH`
    
    // Guardar balance del contrato para la vista de retiro
    document.getElementById('contractBalance').value = `${contractBalanceFormatted} ETH`
    
    // Mostrar mensaje de éxito si todo está bien
    showStatus('walletStatus', '', 'success')
    
  } catch (err) {
    console.error('Error al actualizar balances:', err)
    const errMessage = err.message || err.toString()
    document.getElementById('walletBalance').textContent = 'Error'
    showStatus('walletStatus', `Error: ${errMessage}`, 'error')
  }
}

// Manejar acciones de billetera
function handleWalletAction(action) {
  hideAllSubviews()
  
  switch (action) {
    case 'send':
      showSubview('send')
      break
    case 'receive':
      showSubview('receive')
      document.getElementById('receiveAddress').value = AppState.currentAccount
      break
    case 'withdraw':
      showSubview('withdraw')
      document.getElementById('withdrawAddress').value = AppState.currentAccount
      updateWalletBalances()
      break
  }
}

// Mostrar subvista
function showSubview(name) {
  hideAllSubviews()
  const subview = document.getElementById(`${name}Subview`)
  if (subview) {
    subview.style.display = 'block'
  }
}

// Ocultar subvista
function hideSubview(name) {
  const subview = document.getElementById(`${name}Subview`)
  if (subview) {
    subview.style.display = 'none'
  }
}

// Ocultar todas las subvistas
function hideAllSubviews() {
  document.querySelectorAll('[id$="Subview"]').forEach(view => {
    view.style.display = 'none'
  })
}

// Manejar envío
async function handleSend() {
  const toAddress = document.getElementById('sendToAddress').value.trim()
  const amount = document.getElementById('sendAmount').value
  const reference = document.getElementById('sendReference').value.trim()
  
  if (!toAddress || !ethers.utils.isAddress(toAddress)) {
    showStatus('sendStatus', 'Por favor, ingresa una dirección válida', 'error')
    return
  }
  
  if (!amount || parseFloat(amount) <= 0) {
    showStatus('sendStatus', 'Por favor, ingresa una cantidad válida', 'error')
    return
  }
  
  try {
    document.getElementById('btnSend').disabled = true
    showStatus('sendStatus', 'Enviando transacción...', 'info')
    
    // Verificar si la cuenta actual está en MetaMask o es del RPC local
    const accountSource = AppState.accountSources.find(s => 
      s.address.toLowerCase() === AppState.currentAccount?.toLowerCase()
    )
    
    // Si la cuenta no está en MetaMask, intentar usar el contrato directamente con el RPC
    if (!accountSource || accountSource.source !== 'MetaMask') {
      // Para cuentas de Ganache, necesitamos que estén importadas en MetaMask para firmar
      // O usar el fund-server si está disponible
      if (!window.ethereum) {
        throw new Error('MetaMask no está disponible. Las transacciones requieren MetaMask para firmar.')
      }
      
      // Intentar cambiar a esta cuenta en MetaMask
      try {
        if (window.P2P && window.P2P.switchAccount) {
          await window.P2P.switchAccount(AppState.currentAccount)
        }
        // Actualizar signer
        AppState.currentProvider = new ethers.providers.Web3Provider(window.ethereum)
        AppState.currentSigner = AppState.currentProvider.getSigner(AppState.currentAccount)
      } catch (switchErr) {
        throw new Error(`La cuenta ${AppState.currentAccount.substring(0, 6)}... no está disponible en MetaMask. Por favor, impórtala en MetaMask usando su clave privada de Ganache.`)
      }
    }
    
    // Realizar el pago
    if (window.P2P && window.P2P.payTo) {
      await window.P2P.payTo(toAddress, amount, reference || '')
      showStatus('sendStatus', '✅ Transacción enviada exitosamente', 'success')
      
      // Limpiar formulario
      document.getElementById('sendToAddress').value = ''
      document.getElementById('sendAmount').value = ''
      document.getElementById('sendReference').value = ''
      
      // Actualizar balances
      setTimeout(() => {
        updateWalletBalances()
      }, 2000)
      
    } else {
      // Fallback: usar el contrato directamente
      if (!AppState.contractInfo) {
        throw new Error('Información del contrato no disponible')
      }
      
      const contract = new ethers.Contract(
        AppState.contractInfo.address,
        AppState.contractInfo.abi,
        AppState.currentSigner
      )
      
      const tx = await contract.payTo(
        toAddress,
        ethers.utils.formatBytes32String(reference || ''),
        { value: ethers.utils.parseEther(amount) }
      )
      
      await tx.wait()
      showStatus('sendStatus', '✅ Transacción enviada exitosamente', 'success')
      
      // Limpiar formulario
      document.getElementById('sendToAddress').value = ''
      document.getElementById('sendAmount').value = ''
      document.getElementById('sendReference').value = ''
      
      // Actualizar balances
      setTimeout(() => {
        updateWalletBalances()
      }, 2000)
    }
    
  } catch (err) {
    console.error('Error al enviar:', err)
    showStatus('sendStatus', `Error: ${err.message}`, 'error')
  } finally {
    document.getElementById('btnSend').disabled = false
  }
}

// Copiar dirección
async function copyAddress() {
  try {
    await navigator.clipboard.writeText(AppState.currentAccount)
    showStatus('walletStatus', '✅ Dirección copiada al portapapeles', 'success')
    setTimeout(() => {
      document.getElementById('walletStatus').innerHTML = ''
    }, 3000)
  } catch (err) {
    showStatus('walletStatus', 'Error al copiar dirección', 'error')
  }
}

// Manejar retiro
async function handleWithdraw() {
  if (!AppState.currentAccount) {
    showStatus('withdrawStatus', 'No hay cuenta conectada', 'error')
    return
  }
  
  try {
    document.getElementById('btnWithdraw').disabled = true
    showStatus('withdrawStatus', 'Procesando retiro...', 'info')
    
    if (window.P2P && window.P2P.withdraw) {
      await window.P2P.withdraw()
      showStatus('withdrawStatus', '✅ Retiro realizado exitosamente', 'success')
      
      // Actualizar balances
      setTimeout(() => {
        updateWalletBalances()
      }, 2000)
      
    } else {
      throw new Error('P2P API no disponible')
    }
    
  } catch (err) {
    console.error('Error al retirar:', err)
    showStatus('withdrawStatus', `Error: ${err.message}`, 'error')
  } finally {
    document.getElementById('btnWithdraw').disabled = false
  }
}

// Cargar vista P2P
async function loadP2PView() {
  if (!AppState.currentAccount) {
    showStatus('p2pStatus', 'Por favor, conecta tu billetera primero', 'error')
    switchView('login')
    return
  }
  
  // Actualizar selectores de cuentas
  updateAccountSelectors()
  
  // Si hay cuentas, seleccionar la primera para cada usuario
  if (AppState.accounts.length > 0) {
    if (AppState.accounts.length >= 1) {
      document.getElementById('p2pAccount1').value = AppState.accounts[0]
      await updateP2PUser(1, AppState.accounts[0])
    }
    if (AppState.accounts.length >= 2) {
      document.getElementById('p2pAccount2').value = AppState.accounts[1]
      await updateP2PUser(2, AppState.accounts[1])
    }
  }
}

// Actualizar usuario P2P
async function updateP2PUser(userNum, address) {
  if (!address) {
    document.getElementById(`p2pAddress${userNum}`).value = ''
    document.getElementById(`p2pBalance${userNum}`).value = '0.00 ETH'
    document.getElementById(`p2pUser${userNum}`).classList.remove('active')
    return
  }
  
  try {
    document.getElementById(`p2pAddress${userNum}`).value = address
    document.getElementById(`p2pUser${userNum}`).classList.add('active')
    
    // Determinar qué provider usar (MetaMask o RPC local)
    let provider = AppState.currentProvider
    
    if (!provider) {
      // Intentar usar MetaMask primero
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
      } else {
        // Usar RPC local
        const rpcPorts = [7545, 8546, 8545] // Puerto 7545 es el por defecto de Ganache GUI
        for (const port of rpcPorts) {
          try {
            const testProvider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${port}`)
            await Promise.race([
              testProvider.getBlockNumber(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ])
            provider = testProvider
            AppState.rpcProvider = provider
            break
          } catch (e) {
            continue
          }
        }
      }
    }
    
    if (!provider) {
      throw new Error('No se pudo conectar a ningún provider')
    }
    
    // Obtener balance de ETH
    const ethBalance = await provider.getBalance(address)
    const ethBalanceFormatted = ethers.utils.formatEther(ethBalance)
    
    // Balance en contrato
    if (AppState.contractInfo) {
      const contract = new ethers.Contract(
        AppState.contractInfo.address,
        AppState.contractInfo.abi,
        provider
      )
      const contractBalance = await contract.balanceOf(address)
      const contractBalanceFormatted = ethers.utils.formatEther(contractBalance)
      const total = parseFloat(ethBalanceFormatted) + parseFloat(contractBalanceFormatted)
      document.getElementById(`p2pBalance${userNum}`).value = `${total.toFixed(4)} ETH`
    } else {
      document.getElementById(`p2pBalance${userNum}`).value = `${ethBalanceFormatted} ETH`
    }
    
  } catch (err) {
    console.error(`Error al actualizar usuario ${userNum}:`, err)
    document.getElementById(`p2pBalance${userNum}`).value = 'Error'
  }
}

// Manejar envío P2P
async function handleP2PSend() {
  const fromUser = document.getElementById('p2pFromUser').value
  const toUser = document.getElementById('p2pToUser').value
  const amount = document.getElementById('p2pAmount').value
  const reference = document.getElementById('p2pReference').value.trim()
  
  if (!fromUser || !toUser) {
    showStatus('p2pStatus', 'Por favor, selecciona usuarios de origen y destino', 'error')
    return
  }
  
  if (fromUser === toUser) {
    showStatus('p2pStatus', 'El usuario de origen y destino deben ser diferentes', 'error')
    return
  }
  
  const fromAddress = document.getElementById(`p2pAddress${fromUser}`).value
  const toAddress = document.getElementById(`p2pAddress${toUser}`).value
  
  if (!fromAddress || !toAddress) {
    showStatus('p2pStatus', 'Por favor, selecciona cuentas para ambos usuarios', 'error')
    return
  }
  
  if (!ethers.utils.isAddress(toAddress)) {
    showStatus('p2pStatus', 'La dirección de destino no es válida', 'error')
    return
  }
  
  if (!amount || parseFloat(amount) <= 0) {
    showStatus('p2pStatus', 'Por favor, ingresa una cantidad válida', 'error')
    return
  }
  
  try {
    document.getElementById('btnP2PSend').disabled = true
    showStatus('p2pStatus', 'Procesando transacción P2P...', 'info')
    
    // Cambiar temporalmente al signer del usuario que envía
    const originalSigner = AppState.currentSigner
    const originalAccount = AppState.currentAccount
    
    // Verificar si la cuenta está en MetaMask
    const fromAccountSource = AppState.accountSources.find(s => 
      s.address.toLowerCase() === fromAddress.toLowerCase()
    )
    
    if (!fromAccountSource || fromAccountSource.source !== 'MetaMask') {
      // La cuenta no está en MetaMask, necesitamos que el usuario la importe
      throw new Error(`La cuenta ${fromAddress.substring(0, 6)}... no está en MetaMask. Por favor, impórtala en MetaMask usando su clave privada de Ganache para poder realizar transacciones.`)
    }
    
    // Cambiar a la cuenta que envía usando MetaMask
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no está disponible')
      }
      
      // Solicitar a MetaMask que cambie a la cuenta que envía
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
      
      // Cambiar usando P2P si está disponible
      if (window.P2P && window.P2P.switchAccount) {
        await window.P2P.switchAccount(fromAddress)
      }
      
      // Actualizar provider y signer
      AppState.currentProvider = new ethers.providers.Web3Provider(window.ethereum)
      AppState.currentSigner = AppState.currentProvider.getSigner(fromAddress)
      AppState.currentAccount = fromAddress
      
    } catch (switchErr) {
      console.warn('No se pudo cambiar de cuenta automáticamente:', switchErr)
      // Si no se puede cambiar, verificar que la cuenta actual sea la correcta
      if (AppState.currentAccount && AppState.currentAccount.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error(`Por favor, cambia manualmente a la cuenta ${fromAddress.substring(0, 6)}... en MetaMask para realizar esta transacción.`)
      }
    }
    
    // Realizar el pago
    if (window.P2P && window.P2P.payTo) {
      await window.P2P.payTo(toAddress, amount, reference || 'P2P Payment')
      showStatus('p2pStatus', '✅ Transacción P2P realizada exitosamente', 'success')
      
      // Limpiar formulario
      document.getElementById('p2pAmount').value = ''
      document.getElementById('p2pReference').value = ''
      
      // Actualizar balances después de un delay
      setTimeout(async () => {
        await updateP2PUser(1, document.getElementById('p2pAccount1').value)
        await updateP2PUser(2, document.getElementById('p2pAccount2').value)
      }, 3000)
      
    } else {
      // Fallback: usar el contrato directamente
      if (!AppState.contractInfo) {
        throw new Error('Información del contrato no disponible')
      }
      
      const contract = new ethers.Contract(
        AppState.contractInfo.address,
        AppState.contractInfo.abi,
        AppState.currentSigner
      )
      
      const tx = await contract.payTo(
        toAddress,
        ethers.utils.formatBytes32String(reference || 'P2P Payment'),
        { value: ethers.utils.parseEther(amount) }
      )
      
      await tx.wait()
      showStatus('p2pStatus', '✅ Transacción P2P realizada exitosamente', 'success')
      
      // Limpiar formulario
      document.getElementById('p2pAmount').value = ''
      document.getElementById('p2pReference').value = ''
      
      // Actualizar balances
      setTimeout(async () => {
        await updateP2PUser(1, document.getElementById('p2pAccount1').value)
        await updateP2PUser(2, document.getElementById('p2pAccount2').value)
      }, 3000)
    }
    
    // Restaurar cuenta original si es posible
    if (originalAccount && originalAccount !== fromAddress) {
      try {
        if (window.P2P && window.P2P.switchAccount) {
          await window.P2P.switchAccount(originalAccount)
        }
        AppState.currentSigner = AppState.currentProvider.getSigner(originalAccount)
        AppState.currentAccount = originalAccount
      } catch (restoreErr) {
        console.warn('No se pudo restaurar la cuenta original:', restoreErr)
      }
    }
    
  } catch (err) {
    console.error('Error en transacción P2P:', err)
    showStatus('p2pStatus', `Error: ${err.message}`, 'error')
  } finally {
    document.getElementById('btnP2PSend').disabled = false
  }
}

// Manejar configuración manual del contrato
async function handleSetContract() {
  const input = document.getElementById('contractAddressInput')
  const address = input.value.trim()
  const contractInfoEl = document.getElementById('contractInfo')
  
  if (!address) {
    showStatus('loginStatus', 'Por favor, ingresa una dirección de contrato', 'error')
    return
  }
  
  if (!ethers.utils.isAddress(address)) {
    showStatus('loginStatus', 'La dirección del contrato no es válida', 'error')
    return
  }
  
  try {
    // Intentar obtener ABI desde build artifact
    let abi = null
    try {
      const buildRes = await fetch('/build/contracts/P2PPay.json')
      if (buildRes.ok) {
        const buildData = await buildRes.json()
        abi = buildData.abi
      }
    } catch (e) {
      console.warn('No se pudo cargar ABI desde build artifact, usando ABI por defecto')
      abi = getDefaultABI()
    }
    
    if (!abi) {
      abi = getDefaultABI()
    }
    
    // Guardar información del contrato
    const contractInfo = {
      address: address,
      abi: abi,
      networkId: null,
      projectWallet: null
    }
    
    AppState.contractInfo = contractInfo
    
    // Guardar en localStorage
    try {
      localStorage.setItem('p2ppay_contract_info', JSON.stringify(contractInfo))
    } catch (e) {
      console.debug('No se pudo guardar en localStorage')
    }
    
    // Actualizar UI
    if (contractInfoEl) {
      contractInfoEl.textContent = `✅ Contrato configurado: ${address.substring(0, 10)}...`
      contractInfoEl.style.color = '#a0d0a0'
    }
    
    showStatus('loginStatus', `✅ Contrato configurado: ${address.substring(0, 10)}...`, 'success')
    
    // Limpiar input
    input.value = ''
    
  } catch (err) {
    console.error('Error al configurar contrato:', err)
    showStatus('loginStatus', `Error: ${err.message}`, 'error')
  }
}

// Mostrar mensaje de estado
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId)
  if (!element) return
  
  element.innerHTML = `<div class="status-message status-${type}">${message}</div>`
  
  // Auto-ocultar después de 5 segundos para mensajes de éxito
  if (type === 'success') {
    setTimeout(() => {
      element.innerHTML = ''
    }, 5000)
  }
}
