# 📚 Documentación Completa del Proyecto - P2P Pay

Sistema de pagos P2P (peer-to-peer) basado en blockchain usando Solidity, Truffle y MetaMask.

> **📌 Nota Importante**: Para ver la documentación completa de la última sesión de configuración y mejoras, consulta: [`docs/SESION_COMPLETA.md`](./docs/SESION_COMPLETA.md)

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Inicio Rápido](#inicio-rápido)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Scripts Disponibles](#scripts-disponibles)
5. [Uso de la Interfaz de Usuario](#uso-de-la-interfaz-de-usuario)
6. [Configuración del Contrato](#configuración-del-contrato)
7. [Fondear Cuentas (Funding)](#fondear-cuentas-funding)
8. [Fund Server](#fund-server)
9. [Testing](#testing)
10. [Estructura del Proyecto](#estructura-del-proyecto)
11. [Seguridad](#seguridad)
12. [Solución de Problemas](#solución-de-problemas)
13. [Información Técnica](#información-técnica)

---

## 📋 Descripción del Proyecto

Este proyecto implementa un contrato inteligente de pagos P2P que permite:
- **Pagar a otros usuarios**: Los pagadores pueden acreditar fondos a destinatarios
- **Retirar fondos**: Los destinatarios pueden retirar sus fondos acumulados
- **Protección contra reentrancy**: Implementación de guardia de reentrancia para seguridad

El contrato principal es `P2PPay.sol` que gestiona los balances y permite transacciones seguras entre usuarios.

### Características Principales

- ✅ Interfaz web moderna con modo oscuro
- ✅ Soporte para múltiples cuentas de MetaMask
- ✅ Modo P2P para transacciones entre dos cuentas
- ✅ Detección automática del contrato desde múltiples fuentes
- ✅ Fund Server para fondear cuentas fácilmente
- ✅ Protección contra reentrancy en el contrato

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 16 (recomendado)
- **npm** o **yarn**
- **MetaMask** (extensión del navegador)
- **Ganache** (CLI o GUI) para blockchain local

### Pasos Iniciales

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar Ganache**:
   ```bash
   npm run start-ganache
   ```

3. **Desplegar el contrato**:
   ```bash
   npm run build-and-export
   ```

4. **Iniciar los servidores**:
   ```bash
   # Terminal 1 - Fund Server
   npm run fund-server
   
   # Terminal 2 - UI Server
   npm run ui
   ```

5. **Abrir la aplicación**:
   - Navega a: `http://127.0.0.1:8080/app.html`

---

## ⚙️ Instalación y Configuración

### Instalación

```bash
# Clonar el repositorio (si aplica)
# cd proyecto-de-inv-op

# Instalar dependencias
npm install
```

### Configuración

1. **Crear archivo `.env`** (opcional, para personalizar configuración):
   - Copia el archivo `env.example.txt` y renómbralo a `.env`
   - Ajusta los valores según tus necesidades
   - El archivo `.env` será cargado automáticamente por dotenv

   **Variables disponibles:**
   - `GANACHE_RPC`: URL del RPC de Ganache (por defecto: http://127.0.0.1:7545)
   - `FUND_SERVER_PORT`: Puerto del servidor de funding (por defecto: 3001)
   - `FUND_SECRET`: Secret opcional para proteger el servidor de funding
   - `PROJECT_WALLET`: Wallet del proyecto para fondear durante las migraciones
   - `FUND_AMOUNT`: Cantidad de ETH a enviar a PROJECT_WALLET (por defecto: 1)

2. **Iniciar Ganache GUI**:
   - Abre Ganache GUI y crea/inicia un workspace con el puerto **7545** (puerto por defecto)
   - O si prefieres usar Ganache CLI, ejecuta: `npm run start-ganache` (usará puerto 8546)
   
   **Nota**: El proyecto está configurado para usar Ganache GUI en el puerto **7545** por defecto.

### Despliegue del Contrato

```bash
# Compilar y desplegar el contrato
npm run build-and-export
```

Este comando:
1. Compila los contratos Solidity
2. Despliega el contrato P2PPay en la red Ganache
3. Exporta el artifact (ABI + dirección) al frontend

### Configuración de Puertos

El proyecto está configurado para usar Ganache GUI con puertos estándar:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Ganache GUI | **7545** | Blockchain local (puerto por defecto de Ganache GUI) |
| Fund Server | 3001 | Servidor para fondear cuentas |
| UI Server | 8080 | Interfaz de usuario web |

**Nota**: El fund-server busca automáticamente Ganache en los puertos: 7545, 8546, 8545 (en ese orden).

---

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start-ganache` | Inicia Ganache CLI en el puerto 8546 (alternativa a Ganache GUI) |
| `npm run build-and-export` | Compila, despliega y exporta el contrato |
| `npm run test` | Ejecuta los tests de Truffle |
| `npm run fund-server` | Inicia el servidor para fondear cuentas |
| `npm run ui` | Inicia el servidor de la interfaz de usuario |
| `npm run fund -- <address> <amount>` | Fondea una dirección desde la línea de comandos |
| `npm run export-frontend-artifact` | Exporta el artifact del contrato al frontend |
| `npm run ganache-keys` | Muestra las claves privadas de las cuentas de Ganache |

---

## 🎯 Uso de la Interfaz de Usuario

### Acceso a la Aplicación

1. **Inicia Ganache**:
   ```bash
   npm run start-ganache
   ```

2. **Despliega el contrato** (si aún no lo has hecho):
   ```bash
   npm run build-and-export
   ```

3. **Inicia el servidor UI**:
   ```bash
   npm run ui
   ```

4. **Abre en el navegador**:
   - Navega a: `http://127.0.0.1:8080/app.html`
   - O simplemente: `http://127.0.0.1:8080/` y luego haz clic en `app.html`

### Secciones de la Aplicación

#### 1. 🔐 Inicio de Sesión

La primera vista que verás al abrir la aplicación.

**Funcionalidades:**
- **Conectar MetaMask**: Haz clic en el botón "Conectar MetaMask" para conectar tu billetera
- **Selector de Cuentas**: Una vez conectado, puedes seleccionar entre diferentes cuentas de MetaMask
- **Información de Cuenta**: Se muestra la cuenta actualmente seleccionada
- **Configuración Avanzada**: Permite configurar manualmente la dirección del contrato

**Requisitos:**
- MetaMask debe estar instalado en tu navegador
- MetaMask debe estar configurado con la red Ganache (RPC: `http://127.0.0.1:7545`, Chain ID: `1337`)
- Al menos una cuenta debe estar importada en MetaMask

#### 2. 💰 Billetera

Vista principal para gestionar tu billetera.

**Información Mostrada:**
- **Balance Total**: Muestra la suma de tu balance de ETH y el balance en el contrato
- **Dirección**: Tu dirección de billetera actual

**Acciones Disponibles:**

##### 📤 Enviar
- Permite enviar ETH a otra dirección usando el contrato P2PPay
- Campos requeridos:
  - **Dirección destino**: Dirección Ethereum válida (0x...)
  - **Cantidad**: Cantidad en ETH a enviar
  - **Referencia** (opcional): Texto de referencia para la transacción (máx. 32 caracteres)

##### 📥 Recibir
- Muestra tu dirección de billetera para que otros puedan enviarte fondos
- Incluye botón para copiar la dirección al portapapeles
- La dirección se puede compartir con otros usuarios

##### 💸 Retirar
- Permite retirar fondos que tienes depositados en el contrato P2PPay
- Muestra tu balance actual en el contrato
- Retira todos los fondos disponibles en el contrato

#### 3. 💬 Modo P2P

Vista para realizar transacciones entre dos cuentas diferentes.

**Configuración:**
1. **Usuario 1**: Selecciona la primera cuenta desde el dropdown
2. **Usuario 2**: Selecciona la segunda cuenta desde el dropdown
3. Cada usuario muestra:
   - Su dirección
   - Su balance total (ETH + contrato)

**Realizar Transacción:**
1. Selecciona el **usuario de origen** (quien envía)
2. Selecciona el **usuario de destino** (quien recibe)
3. Ingresa la **cantidad** en ETH
4. (Opcional) Agrega una **referencia**
5. Haz clic en "Enviar Transacción"

**Nota Importante:**
- Los usuarios de origen y destino deben ser diferentes
- MetaMask puede solicitar confirmación para cambiar de cuenta
- La transacción se realiza usando el contrato P2PPay
- Los balances se actualizan automáticamente después de la transacción

### 🔄 Cambiar entre Cuentas de MetaMask

La UI incluye un **selector de cuentas** que te permite cambiar entre todas las cuentas disponibles en MetaMask sin necesidad de desconectar y volver a conectar.

#### Cómo usar el selector de cuentas:

1. **Conecta MetaMask** haciendo clic en "Conectar MetaMask"
2. **Selecciona una cuenta** del dropdown que aparece automáticamente
3. **Todas las operaciones** (pagos, retiros, etc.) se realizarán con la cuenta seleccionada
4. **El balance se actualiza** automáticamente cuando cambias de cuenta

#### Características:

- ✅ **Cambio instantáneo**: No necesitas desconectar y volver a conectar
- ✅ **Múltiples cuentas**: Accede a todas las cuentas de MetaMask desde un solo lugar
- ✅ **Sincronización automática**: Si cambias de cuenta directamente en MetaMask, la UI se actualiza automáticamente
- ✅ **Balance actualizado**: El balance del contrato se actualiza según la cuenta seleccionada
- ✅ **Operaciones independientes**: Cada cuenta mantiene su propio balance en el contrato

#### Notas importantes:

- **Cada cuenta tiene su propio balance**: Los fondos en el contrato están asociados a cada dirección específica
- **Las transacciones usan la cuenta activa**: Todas las operaciones (pagar, retirar, fundear proyecto) se realizan con la cuenta seleccionada en el dropdown
- **Sincronización bidireccional**: Si cambias de cuenta en MetaMask, la UI se actualiza. Si cambias en la UI, MetaMask también se actualiza

### 📝 Entendiendo el Campo "Reference"

El campo **"Reference"** es un parámetro opcional que se usa en las funciones de pago (`payTo` y `fundProjectWallet`) para etiquetar o identificar transacciones.

#### ¿Qué es el Reference?

- **Tipo de dato**: `bytes32` en el contrato (32 bytes = 32 caracteres máximo)
- **Propósito**: Identificador opcional para etiquetar pagos con información adicional
- **Ejemplos de uso**:
  - Número de factura: `"invoice-001"`
  - ID de orden: `"order-12345"`
  - Descripción corta: `"payment-jan"`
  - Referencia de pago: `"ref-2024-01"`

#### Características Importantes

1. **Longitud máxima**: 32 caracteres
   - Si ingresas más de 32 caracteres, se truncará automáticamente
   - Ejemplo: `"esta-es-una-referencia-muy-larga-que-se-trunca"` → se guardará como `"esta-es-una-referencia-muy"`

2. **Es opcional**: Puedes dejarlo vacío
   - Si no ingresas nada, se usará un string vacío (`""`)
   - El contrato funcionará normalmente sin referencia

3. **Se almacena en el evento**: 
   - El Reference se emite en el evento `PaymentRegistered`
   - Puedes consultarlo en los logs de transacciones
   - Útil para auditoría y seguimiento de pagos

4. **Conversión automática**:
   - El frontend convierte automáticamente tu texto a `bytes32`
   - Usa `ethers.utils.formatBytes32String()` internamente
   - Si el texto es más corto que 32 caracteres, se rellena con ceros

#### Ejemplos de Uso

**Ejemplo 1 - Con referencia**:
```
Project Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Amount: 1.5 ETH
Reference: "funding-jan-2024"
```
→ El pago se etiquetará con "funding-jan-2024" en el evento

**Ejemplo 2 - Sin referencia**:
```
Project Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Amount: 1.5 ETH
Reference: (vacío)
```
→ El pago se realizará normalmente sin etiqueta

**Ejemplo 3 - Referencia larga (se trunca)**:
```
Reference: "esta-es-una-referencia-demasiado-larga-para-el-contrato"
```
→ Se guardará como: "esta-es-una-referencia-demasiado"

#### ¿Cuándo usar Reference?

- ✅ **Útil para**: Identificar pagos, facturas, órdenes, períodos de pago
- ✅ **Útil para**: Auditoría y seguimiento de transacciones
- ❌ **No usar para**: Información sensible (no está encriptada)
- ❌ **No usar para**: Datos largos (máximo 32 caracteres)

**Nota técnica**: El Reference se almacena como `bytes32` en el contrato, lo que significa que es eficiente en gas pero limitado en longitud. Para información más extensa, considera usar eventos adicionales o almacenamiento fuera de la cadena.

### 🔄 Flujo de Trabajo Típico

#### Escenario 1: Enviar Dinero a Otro Usuario
1. Conecta tu billetera (Inicio de Sesión)
2. Ve a "Billetera"
3. Haz clic en "Enviar"
4. Ingresa la dirección destino y cantidad
5. Confirma la transacción en MetaMask
6. Espera la confirmación

#### Escenario 2: Recibir Dinero
1. Conecta tu billetera
2. Ve a "Billetera"
3. Haz clic en "Recibir"
4. Copia tu dirección y compártela con quien te enviará dinero
5. Espera a recibir la transacción

#### Escenario 3: Retirar Fondos del Contrato
1. Conecta tu billetera
2. Ve a "Billetera"
3. Haz clic en "Retirar"
4. Verifica tu balance en el contrato
5. Haz clic en "Retirar Todo"
6. Confirma en MetaMask

#### Escenario 4: Transacción P2P entre Dos Cuentas
1. Conecta tu billetera
2. Ve a "Modo P2P"
3. Selecciona dos cuentas diferentes (Usuario 1 y Usuario 2)
4. Configura la transacción (origen, destino, cantidad)
5. Envía la transacción
6. MetaMask puede solicitar cambiar de cuenta
7. Confirma la transacción

---

## 🔧 Configuración del Contrato

La aplicación P2P Pay puede detectar automáticamente la dirección del contrato desde múltiples fuentes, permitiendo que funcione desde cualquier URL sin configuración manual.

### 🔍 Fuentes de Detección (en orden de prioridad)

1. **Parámetros de URL** (máxima prioridad)
   - Usa `?contract=0x...` o `?address=0x...` en la URL
   - Ejemplo: `http://localhost:8080/app.html?contract=0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4`

2. **LocalStorage**
   - Si se guardó previamente una configuración, se carga automáticamente
   - Se guarda automáticamente cuando se detecta un contrato

3. **Archivo `p2ppay.json`**
   - Ubicación estándar: `/frontend/p2ppay.json`
   - Generado por `npm run build-and-export`

4. **Build Artifact de Truffle**
   - Ubicación: `/build/contracts/P2PPay.json`
   - Se busca el deployment más reciente automáticamente

5. **Detección desde Provider**
   - Si MetaMask está conectado, intenta detectar el contrato según el Chain ID actual
   - Busca en el build artifact por el networkId/chainId correspondiente

### 🛠️ Configuración Manual

Si necesitas usar un contrato diferente al detectado automáticamente:

#### Opción 1: Parámetro de URL
```
http://localhost:8080/app.html?contract=0xTU_DIRECCION_AQUI
```

#### Opción 2: Desde la Interfaz
1. Abre la aplicación
2. En la vista de "Inicio de Sesión", expande "⚙️ Configuración avanzada (Contrato)"
3. Ingresa la dirección del contrato
4. Haz clic en "Configurar Contrato"

#### Opción 3: LocalStorage (desde consola del navegador)
```javascript
localStorage.setItem('p2ppay_contract_info', JSON.stringify({
  address: '0xTU_DIRECCION_AQUI',
  abi: [...], // ABI del contrato
  networkId: null,
  projectWallet: null
}))
```

### 📝 Notas

- La aplicación guarda automáticamente la configuración en `localStorage` para futuras cargas
- Si el contrato se detecta desde la URL, tiene prioridad sobre otras fuentes
- El ABI se obtiene automáticamente desde el build artifact si está disponible
- Si no se encuentra el ABI, se usa un ABI por defecto con las funciones básicas del contrato P2PPay

### 🔄 Actualizar Contrato

Para cambiar el contrato después de haberlo configurado:

1. **Desde URL**: Agrega el parámetro `?contract=0xNUEVA_DIRECCION`
2. **Desde UI**: Usa el campo de configuración avanzada
3. **Limpiar localStorage**: 
   ```javascript
   localStorage.removeItem('p2ppay_contract_info')
   ```
   Luego recarga la página

### ✅ Verificación

Para verificar qué contrato está siendo usado:

1. Abre la consola del navegador (F12)
2. Busca el mensaje: `✅ Contrato configurado: 0x...`
3. O revisa el elemento `#contractInfo` en la vista de login

---

## 💰 Fondear Cuentas (Funding)

### Obtener Claves Privadas de Ganache

Para obtener las claves privadas de las cuentas de Ganache:

```bash
npm run ganache-keys
```

Este comando muestra:
- Las claves privadas de todas las cuentas de Ganache
- Las direcciones correspondientes
- El estado de cada cuenta (si está activa en Ganache)

**Nota**: Si Ganache se inició con un mnemonic diferente al por defecto, las claves mostradas pueden no coincidir. En ese caso, revisa la salida de la consola donde iniciaste Ganache.

### Método 1: Importar Clave Privada en MetaMask (Recomendado)

1. **Obtener clave privada de Ganache**:
   ```bash
   npm run ganache-keys
   ```
   O revisa la salida de la consola donde iniciaste Ganache (`npm run start-ganache`)

2. **Importar en MetaMask**:
   - Abre MetaMask
   - Ve a "Importar cuenta"
   - Pega la clave privada
   - Selecciona la red Ganache (RPC: `http://127.0.0.1:7545`, Chain ID: `1337`)

3. **Verificar balance**: La cuenta importada mostrará el balance de ETH de Ganache

### Método 2: Usar Fund Server + UI

1. **Inicia el Fund Server**:
   ```bash
   npm run fund-server
   ```

2. **Inicia la UI**:
   ```bash
   npm run ui
   ```

3. **Abre la UI** (`http://127.0.0.1:8080`) y conecta MetaMask a la red Ganache

4. **Fondear cuenta**: Haz clic en "Fundear mi cuenta (Ganache)" y confirma en la UI. El servidor transferirá ETH desde la cuenta 0 de Ganache a tu dirección de MetaMask conectada.

### Método 3: Usar Fund Server desde la Interfaz Web

1. **Abre la interfaz del Fund Server**: `http://127.0.0.1:3001`

2. **Selecciona una cuenta de Ganache** desde el dropdown

3. **Ingresa la dirección destino** y la cantidad de ETH

4. **Haz clic en "Enviar ETH"**

### Método 4: Usar Línea de Comandos

```bash
# Fondea una dirección con 1 ETH
npm run fund -- 0xYourAddressHere 1
```

### Método 5: Fondear Wallet del Proyecto desde la UI

- Usa el botón 'Fundar Wallet del Proyecto' en la UI
- Esto llama al método `payTo` del contrato P2PPay usando la cuenta conectada de MetaMask
- Envía fondos a la wallet del proyecto mediante transferencia on-chain

### Notas sobre Funding

- El fund server usa cuentas de Ganache llamando JSON-RPC `eth_sendTransaction` con la primera cuenta en la lista de Ganache
- La cuenta debe estar desbloqueada por Ganache (por defecto lo está)
- Ganache debe estar corriendo contra el RPC configurado en `scripts/fund_server.js`

---

## 🎮 Fund Server

El Fund Server es un servidor Express que permite fondear cuentas desde Ganache de forma sencilla. Incluye una interfaz web con selector de cuentas.

### Iniciar el Servidor

```bash
npm run fund-server
```

El servidor se iniciará en el puerto **3001** (o el configurado en `FUND_SERVER_PORT`).

### Características Principales

1. **Selector de Cuentas de Ganache**: 
   - Interfaz web con dropdown para elegir entre todas las cuentas disponibles
   - Muestra el balance de cada cuenta
   - Permite seleccionar qué cuenta usar para enviar fondos

2. **Interfaz Web**:
   - Accede a `http://127.0.0.1:3001` en tu navegador
   - Interfaz intuitiva para enviar ETH desde cualquier cuenta de Ganache

3. **API REST**:
   - Endpoint `/health`: Estado del servidor y conexión con Ganache
   - Endpoint `/accounts`: Lista todas las cuentas disponibles con sus balances
   - Endpoint `/fund`: Envía ETH desde una cuenta seleccionada

4. **Detección Automática en la UI Principal**:
   - La UI principal (`http://127.0.0.1:8080`) detecta automáticamente si el fund-server está activo
   - Verifica el estado cada 5 segundos automáticamente
   - Busca el servidor en los puertos 3001-3012
   - Muestra un indicador visual del estado de conexión

### Pasos para Usar el Fund Server

1. **Asegúrate de que Ganache esté corriendo**:
   ```bash
   npm run start-ganache
   ```

2. **Inicia el Fund Server**:
   ```bash
   npm run fund-server
   ```

3. **Abre la interfaz web**:
   - Navega a `http://127.0.0.1:3001` en tu navegador
   - Verás el estado de conexión con Ganache

4. **Selecciona una cuenta**:
   - El dropdown mostrará todas las cuentas disponibles de Ganache
   - Cada opción muestra: número de cuenta, dirección (abreviada) y balance
   - Haz clic en "🔄 Actualizar" para recargar las cuentas y balances

5. **Envía fondos**:
   - Ingresa la dirección destino
   - Especifica la cantidad de ETH a enviar
   - (Opcional) Ingresa el secret si el servidor está protegido
   - Haz clic en "Enviar ETH"

### Uso desde la Línea de Comandos

También puedes usar el endpoint `/fund` directamente:

```bash
# Ejemplo usando curl
curl -X POST http://127.0.0.1:3001/fund \
  -H "Content-Type: application/json" \
  -d '{
    "target": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "1.5",
    "fromAccount": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
  }'
```

**Parámetros**:
- `target` (requerido): Dirección destino
- `amount` (opcional): Cantidad en ETH (por defecto: 1)
- `fromAccount` (opcional): Dirección de la cuenta de Ganache a usar (por defecto: primera cuenta)

### Configuración Avanzada

**Cambiar el puerto**:
```powershell
# Windows PowerShell
$env:FUND_SERVER_PORT='3002'
npm run fund-server
```

**Proteger el servidor con secret**:
```powershell
# Windows PowerShell
$env:FUND_SECRET='mi-secret-seguro'
npm run fund-server
```

Cuando uses un secret, las peticiones POST a `/fund` requieren el header:
```
Authorization: Bearer mi-secret-seguro
```

**Configurar RPC personalizado**:
```powershell
# Si Ganache está en otro puerto
$env:GANACHE_RPC='http://127.0.0.1:7545'
npm run fund-server
```

### Solución de Problemas del Fund Server

**El servidor no encuentra Ganache**:
- Verifica que Ganache GUI esté corriendo en el puerto 7545
- El servidor busca automáticamente en los puertos: 7545, 8546, 8545
- Si usas otro puerto, configura `GANACHE_RPC` en `.env` o como variable de entorno

**No aparecen cuentas en el selector**:
- Verifica la conexión con Ganache en la interfaz web
- Haz clic en "🔄 Actualizar" para recargar
- Asegúrate de que Ganache tenga cuentas creadas

**Error al enviar fondos**:
- Verifica que la cuenta seleccionada tenga suficiente balance
- Asegúrate de que la dirección destino sea válida
- Revisa la consola del servidor para más detalles del error

**La UI muestra "Fund server no está activo" cuando sí lo está**:
- La UI verifica automáticamente el estado del fund-server cada 5 segundos
- Si el mensaje persiste, verifica:
  1. Que el fund-server esté corriendo en el puerto correcto (3001 por defecto)
  2. Que no haya problemas de CORS (el servidor tiene CORS habilitado)
  3. Abre la consola del navegador (F12) para ver errores de red
  4. Intenta acceder directamente a `http://127.0.0.1:3001/health` en tu navegador
- El estado se actualizará automáticamente cuando el servidor esté disponible

**Puerto 3001 ocupado (EADDRINUSE)**:
- Mata el proceso que está usando el puerto (PowerShell):
  ```powershell
  $pid = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
  Stop-Process -Id $pid -Force
  ```
- O inicia el servidor en un puerto diferente:
  ```powershell
  $env:FUND_SERVER_PORT='3002'
  npm run fund-server
  ```

**Problemas de conectividad**:
- Si el fund server imprime `Unable to list Ganache accounts on RPC http://127.0.0.1:XXXX`, entonces el RPC no es accesible
- Confirma el puerto RPC en Ganache GUI o inicia Ganache CLI con el puerto correcto
- Prueba la conectividad RPC con PowerShell:
  ```powershell
  Test-NetConnection -ComputerName 127.0.0.1 -Port 7545
  ```
- Prueba la llamada JSON del cliente RPC:
  ```powershell
  curl -X POST http://127.0.0.1:7545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"web3_clientVersion","params":[]}'
  ```

Si la conexión RPC es rechazada, inicia Ganache en ese puerto o usa la variable de entorno `GANACHE_RPC` correcta al iniciar `npm run fund-server`.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npx truffle test tests/p2ppay.test.js --network ganache
npx truffle test tests/reentrancy.test.js --network ganache
```

---

## 📁 Estructura del Proyecto

```
proyecto-de-inv-op/
├── contracts/          # Contratos Solidity
│   ├── P2PPay.sol     # Contrato principal
│   └── ...
├── migrations/         # Scripts de migración/deployment
├── scripts/            # Scripts de utilidad
│   ├── fund_server.js  # Servidor para fondear cuentas
│   ├── fund_account.js # Script para fondear desde CLI
│   ├── get_ganache_keys.js # Script para obtener claves privadas
│   └── ...
├── frontend/           # Interfaz de usuario
│   ├── index.html      # UI principal (legacy)
│   ├── app.html        # Nueva UI principal (SPA)
│   ├── app.js          # Lógica de la nueva UI
│   ├── metamask_p2p.js # Librería MetaMask
│   └── p2ppay.json     # Artifact del contrato
├── tests/              # Tests del proyecto
├── build/              # Contratos compilados
│   └── contracts/
│       └── P2PPay.json # Artifact de Truffle
├── docs/               # Documentación adicional
│   ├── app-interface.md
│   ├── contract-configuration.md
│   └── funding.md
├── truffle-config.js   # Configuración de Truffle
└── package.json        # Dependencias y scripts
```

---

## 🔐 Seguridad

El contrato `P2PPay` incluye:
- **Protección contra reentrancy**: Implementación de guardia de reentrancia
- **Validación de direcciones**: Verifica que las direcciones no sean cero
- **Validación de montos**: Verifica que los montos sean mayores a cero

---

## 🐛 Solución de Problemas

### Ganache no se conecta

1. Verifica que Ganache GUI esté corriendo en el puerto 7545
2. Verifica el puerto en `truffle-config.js` (debe ser 7545)
3. Si usas otro puerto, configura `GANACHE_RPC` en `.env`

### Puerto ocupado

**Fund Server (3001)**:
```powershell
# Windows PowerShell
$pid = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
Stop-Process -Id $pid -Force
```

**UI Server (8080)**:
```powershell
$pid = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $pid -Force
```

O cambia el puerto usando variables de entorno:
```powershell
$env:FUND_SERVER_PORT='3002'
npm run fund-server
```

### MetaMask no conecta

1. Verifica que MetaMask tenga la red Ganache configurada
2. Asegúrate de que la Chain ID sea `1337`
3. Verifica que el contrato esté desplegado: ejecuta `npm run build-and-export`

### El selector de cuentas no aparece

1. Asegúrate de haber hecho clic en "Conectar MetaMask" primero
2. Verifica que MetaMask tenga al menos una cuenta importada
3. Si tienes múltiples cuentas en MetaMask, todas deberían aparecer en el selector
4. Si el selector no aparece después de conectar, recarga la página

### El balance no se actualiza al cambiar de cuenta

1. El balance se actualiza automáticamente cuando cambias de cuenta
2. Verifica que la cuenta seleccionada tenga fondos en el contrato
3. Asegúrate de que el contrato esté desplegado en la red correcta
4. Si usas "RPC local", desactívalo para ver el balance de MetaMask

### Error al enviar transacción

1. Verifica que tengas suficiente ETH para la transacción y el gas
2. Asegúrate de que la dirección destino sea válida
3. Verifica que el contrato esté desplegado
4. Revisa la consola del navegador (F12) para más detalles

### Balance muestra 0

1. El balance mostrado es la suma de ETH de la cuenta + balance en el contrato
2. Si no has depositado en el contrato, el balance del contrato será 0
3. Usa "Enviar" para depositar fondos en el contrato

### Modo P2P no funciona

1. Asegúrate de seleccionar dos cuentas diferentes
2. Verifica que ambas cuentas tengan fondos suficientes
3. MetaMask puede solicitar cambiar de cuenta manualmente
4. Asegúrate de que las cuentas estén importadas en MetaMask

### Error "Internal JSON-RPC error"

1. Verifica que el contrato esté desplegado: `npm run build-and-export`
2. Asegúrate de que MetaMask esté conectado a la red correcta (Chain ID: 1337)
3. Activa el checkbox "Usar RPC local" si está disponible
4. Verifica que Ganache esté corriendo: `npm run start-ganache`

### Cuentas de diferentes navegadores no se reconocen

- **Limitación**: MetaMask es específico del navegador. Las cuentas en Brave no son visibles en Opera y viceversa.
- **Solución**: Para realizar transacciones, importa la clave privada de la cuenta en el navegador donde estás usando la aplicación.
- **Nota**: Puedes ver balances de cuentas de otros navegadores usando RPC local, pero las transacciones requieren que la cuenta esté en el MetaMask del navegador actual.

---

## 📝 Información Técnica

### Tecnologías Utilizadas

- **Solidity 0.8.17**: Lenguaje de contratos inteligentes
- **Truffle**: Framework de desarrollo para Ethereum
- **Ethers.js**: Librería JavaScript para interactuar con Ethereum
- **Web3.js**: Librería alternativa para interactuar con Ethereum
- **Ganache**: Blockchain local para desarrollo y testing
- **MetaMask**: Billetera de navegador para interactuar con dApps
- **Express**: Servidor Node.js para el Fund Server
- **http-server**: Servidor HTTP simple para servir archivos estáticos

### Notas Técnicas

- Todas las transacciones se realizan a través del contrato P2PPay
- Los fondos enviados se depositan en el contrato, no se transfieren directamente
- Para retirar fondos del contrato, usa la función "Retirar"
- El balance mostrado incluye tanto ETH de la cuenta como fondos en el contrato
- Las referencias están limitadas a 32 caracteres (bytes32)
- El proyecto soporta tanto Web3.js como Ethers.js
- Este proyecto está configurado para desarrollo local con Ganache

### Arquitectura

- **Backend**: Contratos Solidity desplegados en Ganache
- **Frontend**: Aplicación SPA (Single Page Application) con HTML, CSS y JavaScript
- **Servicios**:
  - Fund Server: Servidor Express para fondear cuentas
  - UI Server: Servidor HTTP estático para la interfaz web

---

## 📄 Licencia

ISC

---

## 👤 Autores

- Jonas Fernandez - 29922023
- Angel Salmeron - 30712504
- Santiago Arrieta - 30468049

---

## 📞 Soporte

**¿Necesitas ayuda?** 
- Revisa esta documentación completa
- Revisa los comentarios en el código
- Consulta la consola del navegador (F12) para mensajes de error
- Verifica que todos los servicios estén corriendo (Ganache, Fund Server, UI Server)

## 📖 Documentación Adicional

- **[Tutorial Completo: Configurar Ganache GUI](./docs/ganache-gui-tutorial.md)** - Guía paso a paso para usar Ganache GUI (aplicación gráfica) con el proyecto
- [Guía de Funding](./docs/funding.md) - Cómo fondear cuentas para testing
- [Guía de Interfaz](./docs/app-interface.md) - Cómo usar la interfaz de usuario
- [Configuración del Contrato](./docs/contract-configuration.md) - Detección automática del contrato

---

**Última actualización**: Diciembre 2024
