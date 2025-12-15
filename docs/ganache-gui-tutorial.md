# 🎯 Tutorial Completo: Configurar Ganache GUI con el Proyecto P2P Pay

Este tutorial te guiará paso a paso para configurar Ganache GUI (la aplicación gráfica) con tu proyecto P2P Pay.

---

## 📋 Tabla de Contenidos

1. [Instalación de Ganache GUI](#instalación-de-ganache-gui)
2. [Configuración Inicial](#configuración-inicial)
3. [Conectar MetaMask](#conectar-metamask)
4. [Desplegar el Contrato](#desplegar-el-contrato)
5. [Usar las Cuentas en la Aplicación](#usar-las-cuentas-en-la-aplicación)
6. [Obtener Claves Privadas](#obtener-claves-privadas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📥 Instalación de Ganache GUI

### Opción 1: Descarga Directa (Recomendado)

1. **Visita el sitio oficial de Ganache**:
   - Ve a: https://trufflesuite.com/ganache/
   - O directamente: https://github.com/trufflesuite/ganache/releases

2. **Descarga la versión para Windows**:
   - Busca "Ganache" en la sección de releases
   - Descarga el instalador `.exe` para Windows
   - Versión recomendada: Ganache v7.x o superior

3. **Instala Ganache GUI**:
   - Ejecuta el instalador descargado
   - Sigue las instrucciones del instalador
   - Acepta los términos y condiciones
   - Completa la instalación

### Opción 2: Usando Chocolatey (Windows)

Si tienes Chocolatey instalado:

```powershell
choco install ganache
```

### Verificar la Instalación

1. Abre Ganache GUI desde el menú de inicio
2. Deberías ver la interfaz principal de Ganache

---

## ⚙️ Configuración Inicial

### Paso 1: Crear un Nuevo Workspace

1. **Abre Ganache GUI**
2. **Crea un nuevo workspace**:
   - Haz clic en "New Workspace" o "Nuevo Workspace"
   - O ve a: `File > New Workspace`

### Paso 2: Configurar el Workspace

En la pantalla de configuración, ajusta los siguientes valores:

#### Pestaña "SERVER"

- **Hostname**: `127.0.0.1` (o `localhost`)
- **Port**: `7545` ⚠️ **IMPORTANTE**: Este es el puerto por defecto de Ganache GUI y el proyecto está configurado para usarlo
- **Network ID**: `1337` (o déjalo en el valor por defecto)

#### Pestaña "ACCOUNTS & KEYS"

- **Number of Accounts**: `10` (o el número que prefieras)
- **Default Balance**: `100` ETH (o el valor que prefieras)
- **Mnemonic**: Puedes usar el mnemonic por defecto o crear uno nuevo
  - **Mnemonic por defecto de Ganache CLI**: `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat`
  - Si usas este mnemonic, las cuentas serán las mismas que en Ganache CLI

#### Pestaña "CHAIN"

- **Gas Limit**: `6721975` (valor por defecto está bien)
- **Gas Price**: `20000000000` (20 Gwei, valor por defecto está bien)

### Paso 3: Guardar el Workspace

1. **Nombra tu workspace**:
   - Ejemplo: "P2P Pay Project"
2. **Haz clic en "Save Workspace"** o "Guardar Workspace"
3. **Haz clic en "Save"** para confirmar

### Paso 4: Iniciar el Workspace

1. **Haz clic en el workspace que acabas de crear**
2. **Haz clic en "Start"** o "Iniciar"
3. Ganache GUI debería mostrar el estado "Running" o "Corriendo"

---

## 🔗 Conectar MetaMask

### Paso 1: Agregar la Red Ganache en MetaMask

1. **Abre MetaMask** en tu navegador
2. **Haz clic en el selector de red** (arriba, donde dice "Ethereum Mainnet")
3. **Selecciona "Add Network"** o "Agregar Red"
4. **Haz clic en "Add a network manually"** o "Agregar una red manualmente"

5. **Completa los campos**:
   - **Network Name**: `Ganache Local`
   - **New RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337` (o el Network ID que configuraste en Ganache GUI)
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (déjalo vacío)

6. **Haz clic en "Save"** o "Guardar"

### Paso 2: Importar una Cuenta desde Ganache GUI

1. **Abre Ganache GUI**
2. **Ve a la pestaña "ACCOUNTS"** (si no está visible, haz clic en el workspace)
3. **Selecciona una cuenta** (por ejemplo, la primera)
4. **Haz clic en el ícono de "key"** o en "Show Keys" para ver la clave privada
5. **Copia la clave privada** (empieza con `0x...`)

6. **En MetaMask**:
   - Haz clic en el ícono de cuenta (círculo en la esquina superior derecha)
   - Selecciona "Import Account" o "Importar Cuenta"
   - Pega la clave privada
   - Haz clic en "Import" o "Importar"

7. **Verifica el balance**:
   - La cuenta importada debería mostrar el balance de ETH de Ganache GUI
   - Asegúrate de estar conectado a la red "Ganache Local" en MetaMask

---

## 🚀 Desplegar el Contrato

### Verificar la Configuración

Antes de desplegar, verifica que todo esté configurado correctamente:

1. **Ganache GUI está corriendo** (debe mostrar "Running")
2. **El puerto es 7545** (puerto por defecto de Ganache GUI)
3. **MetaMask está conectado a la red Ganache**

### Desplegar el Contrato

1. **Abre una terminal** en la raíz del proyecto

2. **Despliega el contrato**:
   ```bash
   npm run build-and-export
   ```

   Este comando:
   - Compila los contratos Solidity
   - Despliega el contrato en Ganache GUI
   - Exporta el artifact al frontend

3. **Verifica el despliegue**:
   - En Ganache GUI, ve a la pestaña "TRANSACTIONS"
   - Deberías ver una transacción de "Contract Creation"
   - Haz clic en la transacción para ver los detalles
   - Copia la dirección del contrato (Contract Address)

### Verificar el Contrato en Ganache GUI

1. **En Ganache GUI, ve a la pestaña "CONTRACTS"**
2. **Deberías ver el contrato P2PPay listado**
3. **Haz clic en el contrato** para ver:
   - La dirección del contrato
   - El código del contrato
   - Los eventos emitidos

---

## 💼 Usar las Cuentas en la Aplicación

### Ver Todas las Cuentas en Ganache GUI

1. **Abre Ganache GUI**
2. **Ve a la pestaña "ACCOUNTS"**
3. **Verás todas las cuentas** con:
   - Dirección (Address)
   - Balance en ETH
   - Ícono para ver/copiar la clave privada

### Importar Múltiples Cuentas en MetaMask

Puedes importar varias cuentas desde Ganache GUI a MetaMask:

1. **En Ganache GUI**, para cada cuenta que quieras importar:
   - Haz clic en el ícono de "key"
   - Copia la clave privada

2. **En MetaMask**, importa cada cuenta:
   - Repite el proceso de importación para cada cuenta
   - Todas las cuentas aparecerán en MetaMask

3. **En la aplicación P2P Pay**:
   - Conecta MetaMask
   - Todas las cuentas importadas aparecerán en el selector
   - Puedes cambiar entre cuentas fácilmente

### Usar el Fund Server con Ganache GUI

El Fund Server funciona automáticamente con Ganache GUI:

1. **Asegúrate de que Ganache GUI esté corriendo en el puerto 7545**

2. **Inicia el Fund Server**:
   ```bash
   npm run fund-server
   ```

3. **El Fund Server detectará automáticamente** las cuentas de Ganache GUI en el puerto 7545

---

## 🔑 Obtener Claves Privadas

### Método 1: Desde Ganache GUI (Más Fácil)

1. **Abre Ganache GUI**
2. **Ve a la pestaña "ACCOUNTS"**
3. **Para cada cuenta**:
   - Haz clic en el ícono de "key" 🔑 o en "Show Keys"
   - Se mostrará un modal con:
     - **Address**: La dirección de la cuenta
     - **Private Key**: La clave privada (empieza con `0x...`)
   - Haz clic en el ícono de copiar para copiar la clave privada

### Método 2: Desde el Script del Proyecto

Si configuraste Ganache GUI con el mnemonic por defecto:

```bash
npm run ganache-keys
```

**Nota**: Este método solo funciona si Ganache GUI usa el mnemonic por defecto de Ganache CLI. Si usas un mnemonic diferente, las claves no coincidirán.

### Método 3: Exportar Todas las Claves

Ganache GUI no tiene una función de exportación masiva, pero puedes:

1. **Ir cuenta por cuenta** en la pestaña "ACCOUNTS"
2. **Copiar cada clave privada** manualmente
3. **Guardarlas en un archivo de texto** (¡ten cuidado con la seguridad!)

---

## 🐛 Solución de Problemas

### Problema 1: El Proyecto No Se Conecta a Ganache GUI

**Síntomas**:
- Error: "No se pudo conectar a Ganache"
- El contrato no se despliega
- El Fund Server no encuentra cuentas

**Soluciones**:

1. **Verifica que Ganache GUI esté corriendo**:
   - Debe mostrar "Running" o "Corriendo"
   - El estado debe ser verde

2. **Verifica el puerto**:
   - Ganache GUI debe estar configurado en el puerto `7545`
   - El proyecto está configurado para usar el puerto `7545` por defecto

3. **Verifica la configuración de Truffle**:
   ```bash
   # Revisa truffle-config.js
   # El puerto debe ser 7545
   ```

4. **Prueba la conexión manualmente**:
   ```powershell
   # PowerShell
   Test-NetConnection -ComputerName 127.0.0.1 -Port 7545
   ```

### Problema 2: MetaMask No Se Conecta a Ganache GUI

**Síntomas**:
- MetaMask muestra "Network Error"
- No se pueden ver los balances
- Las transacciones fallan

**Soluciones**:

1. **Verifica la configuración de la red en MetaMask**:
   - RPC URL debe ser: `http://127.0.0.1:7545`
   - Chain ID debe ser: `1337` (o el Network ID de Ganache GUI)

2. **Verifica que Ganache GUI esté corriendo**:
   - Debe estar en estado "Running"

3. **Prueba la conexión desde el navegador**:
   - Abre: `http://127.0.0.1:7545` en tu navegador
   - Deberías ver una respuesta JSON (puede mostrar un error, pero significa que el servidor responde)

4. **Revisa el firewall**:
   - Asegúrate de que el firewall de Windows no esté bloqueando el puerto

### Problema 3: Las Cuentas No Coinciden Entre Ganache CLI y GUI

**Síntomas**:
- Las direcciones de las cuentas son diferentes
- Las claves privadas no coinciden

**Causa**:
- Ganache CLI y Ganache GUI usan mnemonic diferentes por defecto

**Solución**:

1. **Usa el mismo mnemonic en ambos**:
   - Mnemonic por defecto de Ganache CLI: `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat`
   - Configura este mnemonic en Ganache GUI al crear el workspace

2. **O usa solo uno**:
   - Decide si usarás Ganache CLI o Ganache GUI
   - No los uses simultáneamente en el mismo puerto

### Problema 4: El Contrato No Se Despliega

**Síntomas**:
- Error al ejecutar `npm run build-and-export`
- Mensaje: "Network error" o "Connection refused"

**Soluciones**:

1. **Verifica que Ganache GUI esté corriendo**

2. **Verifica el puerto en truffle-config.js**:
   ```javascript
   ganache: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
   }
   ```

3. **Verifica que tengas suficiente balance**:
   - La cuenta que despliega necesita ETH para gas
   - En Ganache GUI, verifica que la primera cuenta tenga balance

4. **Revisa los logs de Ganache GUI**:
   - Ve a la pestaña "LOGS" en Ganache GUI
   - Busca errores o mensajes informativos

### Problema 5: El Fund Server No Encuentra Cuentas

**Síntomas**:
- El Fund Server muestra: "Unable to list Ganache accounts"
- No aparecen cuentas en la interfaz del Fund Server

**Soluciones**:

1. **Verifica que Ganache GUI esté corriendo en el puerto 7545**

2. **El Fund Server detectará automáticamente** las cuentas en el puerto 7545

3. **Reinicia el Fund Server** si es necesario

### Problema 6: Puerto Ya en Uso

**Síntomas**:
- Error: "Port 7545 is already in use"
- Ganache GUI no inicia

**Soluciones**:

1. **Cierra otras instancias de Ganache**:
   - Cierra Ganache CLI si está corriendo
   - Cierra otras instancias de Ganache GUI

2. **Mata el proceso que usa el puerto** (PowerShell):
   ```powershell
   # Para puerto 7545
   $pid = (Get-NetTCPConnection -LocalPort 7545).OwningProcess
   Stop-Process -Id $pid -Force
   ```

### Problema 7: Las Transacciones Fracasan en MetaMask

**Síntomas**:
- MetaMask muestra "Transaction Failed"
- Las transacciones no se confirman

**Soluciones**:

1. **Verifica que tengas suficiente balance**:
   - Necesitas ETH para la transacción + gas
   - En Ganache GUI, verifica el balance de la cuenta

2. **Verifica el límite de gas**:
   - En MetaMask, aumenta el límite de gas si es necesario
   - Ganache GUI tiene un límite de gas configurado

3. **Verifica que el contrato esté desplegado**:
   - En Ganache GUI, ve a "CONTRACTS"
   - Debe aparecer el contrato P2PPay

4. **Revisa los logs de Ganache GUI**:
   - Ve a la pestaña "LOGS"
   - Busca errores relacionados con la transacción

---

## 📝 Resumen de Configuración

### Configuración del Proyecto

El proyecto está configurado para usar Ganache GUI con el puerto **7545** por defecto:

1. **Ganache GUI**:
   - Puerto: `7545` (por defecto)
   - Network ID: `1337`
   - Mnemonic: `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat` (opcional)

2. **MetaMask**:
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`

3. **Proyecto**:
   - `truffle-config.js`: Puerto `7545` (ya configurado)
   - No necesitas cambiar nada

---

## ✅ Checklist de Verificación

Antes de usar Ganache GUI con el proyecto, verifica:

- [ ] Ganache GUI está instalado y corriendo
- [ ] El workspace está configurado con el puerto 7545
- [ ] El Network ID es 1337 (o coincide con la configuración del proyecto)
- [ ] MetaMask tiene la red Ganache configurada con RPC: `http://127.0.0.1:7545`
- [ ] Al menos una cuenta está importada en MetaMask
- [ ] El contrato se puede desplegar correctamente
- [ ] Las cuentas aparecen en la aplicación P2P Pay

---

## 🎯 Ventajas de Usar Ganache GUI

- ✅ **Interfaz visual**: Ver todas las cuentas, transacciones y contratos en una interfaz gráfica
- ✅ **Fácil de usar**: No necesitas recordar comandos de terminal
- ✅ **Ver transacciones en tiempo real**: Ver todas las transacciones y sus detalles
- ✅ **Ver contratos desplegados**: Lista de todos los contratos con sus direcciones
- ✅ **Ver eventos**: Ver los eventos emitidos por los contratos
- ✅ **Copiar información fácilmente**: Botones para copiar direcciones y claves privadas
- ✅ **Logs visuales**: Ver los logs del servidor en tiempo real

---

## 📚 Recursos Adicionales

- **Documentación oficial de Ganache**: https://trufflesuite.com/docs/ganache/
- **Guía de MetaMask**: https://metamask.io/
- **Documentación del proyecto**: Ver `DOCUMENTACION_PROYECTO.md`

---

**¿Necesitas más ayuda?** Revisa la sección de solución de problemas o consulta la documentación completa del proyecto.
