#!/usr/bin/env node
/**
 * Script para obtener las claves privadas de las cuentas de Ganache
 * 
 * Ganache CLI usa un mnemonic por defecto que genera cuentas determinísticas.
 * Este script deriva las claves privadas desde ese mnemonic.
 * 
 * Uso:
 *   node scripts/get_ganache_keys.js [número_de_cuentas]
 */

const { ethers } = require('ethers')
const Web3 = require('web3')
require('dotenv').config()

// Mnemonic por defecto de Ganache CLI
const DEFAULT_GANACHE_MNEMONIC = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

async function getGanacheKeysFromMnemonic(numAccounts = 10) {
  console.log('🔑 Obteniendo claves privadas de Ganache usando el mnemonic por defecto...\n')
  console.log(`Mnemonic: ${DEFAULT_GANACHE_MNEMONIC}\n`)
  console.log('='.repeat(80))
  
  const accounts = []
  
  // Crear un wallet HD desde el mnemonic
  const hdNode = ethers.utils.HDNode.fromMnemonic(DEFAULT_GANACHE_MNEMONIC)
  
  for (let i = 0; i < numAccounts; i++) {
    // Derivar la cuenta i desde el mnemonic (path: m/44'/60'/0'/0/i)
    const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${i}`)
    const address = wallet.address
    const privateKey = wallet.privateKey
    
    accounts.push({
      index: i,
      address: address,
      privateKey: privateKey
    })
  }
  
  return accounts
}

async function getGanacheKeysFromRPC() {
  console.log('🔍 Intentando obtener cuentas desde Ganache RPC...\n')
  
  const rpcPorts = [8546, 7545, 8545]
  const initialRpc = process.env.GANACHE_RPC || 'http://127.0.0.1:8546'
  const candidates = [initialRpc, ...rpcPorts.map(p => `http://127.0.0.1:${p}`)]
  
  for (const rpc of candidates) {
    try {
      const web3 = new Web3(rpc)
      const accounts = await web3.eth.getAccounts()
      
      if (accounts && accounts.length > 0) {
        console.log(`✅ Ganache encontrado en: ${rpc}`)
        console.log(`   Cuentas disponibles: ${accounts.length}\n`)
        return { rpc, accounts }
      }
    } catch (e) {
      // Continuar con el siguiente puerto
      continue
    }
  }
  
  return null
}

async function main() {
  const numAccounts = process.argv[2] ? parseInt(process.argv[2]) : 10
  
  console.log('='.repeat(80))
  console.log('🔐 GANACHE PRIVATE KEYS')
  console.log('='.repeat(80))
  console.log()
  
  // Intentar obtener cuentas desde RPC para verificar
  const rpcInfo = await getGanacheKeysFromRPC()
  
  if (rpcInfo) {
    console.log(`📡 Ganache está corriendo en: ${rpcInfo.rpc}`)
    console.log(`   Direcciones encontradas: ${rpcInfo.accounts.length}\n`)
  } else {
    console.log('⚠️  Ganache no está corriendo o no se pudo conectar.')
    console.log('   Mostrando claves privadas basadas en el mnemonic por defecto.\n')
  }
  
  // Obtener claves privadas desde el mnemonic
  const accounts = await getGanacheKeysFromMnemonic(numAccounts)
  
  // Mostrar direcciones reales de Ganache si están disponibles
  if (rpcInfo && rpcInfo.accounts.length > 0) {
    console.log('📡 DIRECCIONES REALES EN GANACHE:\n')
    rpcInfo.accounts.forEach((addr, idx) => {
      console.log(`  Ganache #${idx}: ${addr}`)
    })
    console.log()
  }
  
  console.log('📋 CUENTAS DE GANACHE (Mnemonic por defecto):\n')
  
  accounts.forEach((acc, idx) => {
    const isInRPC = rpcInfo && rpcInfo.accounts.some(a => a.toLowerCase() === acc.address.toLowerCase())
    const status = isInRPC ? '✅ (Activa en Ganache)' : '   (No encontrada en RPC)'
    
    console.log(`Cuenta #${acc.index}:`)
    console.log(`  Dirección:  ${acc.address}`)
    console.log(`  Clave Privada: ${acc.privateKey}`)
    console.log(`  Estado: ${status}`)
    console.log()
  })
  
  // Si las direcciones no coinciden, advertir al usuario
  if (rpcInfo && rpcInfo.accounts.length > 0) {
    const matched = accounts.filter(acc => 
      rpcInfo.accounts.some(a => a.toLowerCase() === acc.address.toLowerCase())
    )
    
    if (matched.length === 0) {
      console.log('⚠️  ADVERTENCIA: Las direcciones del mnemonic por defecto NO coinciden con las de Ganache.')
      console.log('   Esto significa que Ganache se inició con un mnemonic diferente.')
      console.log('   Para obtener las claves privadas correctas:')
      console.log('   1. Revisa la salida de la consola donde iniciaste Ganache (npm run start-ganache)')
      console.log('   2. Las claves privadas se muestran allí cuando se inicia Ganache')
      console.log('   3. O reinicia Ganache con el mnemonic por defecto:')
      console.log('      npx ganache -p 8546 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"')
      console.log()
    }
  }
  
  console.log('='.repeat(80))
  console.log('\n💡 NOTAS:')
  console.log('   - Estas son las claves privadas generadas desde el mnemonic por defecto de Ganache')
  console.log('   - Si Ganache se inició con un mnemonic diferente, estas claves no coincidirán')
  console.log('   - Para importar en MetaMask: Configuración > Importar cuenta > Pegar clave privada')
  console.log('   - Para verificar: Compara las direcciones con las que muestra Ganache al iniciar')
  console.log()
  
  // Mostrar formato para copiar fácilmente
  console.log('📋 FORMATO PARA COPIAR (índice, dirección, clave privada):')
  console.log('='.repeat(80))
  accounts.forEach(acc => {
    console.log(`${acc.index},${acc.address},${acc.privateKey}`)
  })
  console.log('='.repeat(80))
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
