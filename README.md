# Proyecto de Investigación - P2P Pay

Sistema de pagos P2P (peer-to-peer) basado en blockchain usando Solidity, Truffle y MetaMask.

> **📌 Documentación de la Sesión**: Para ver todos los cambios y mejoras realizadas, consulta [`docs/SESION_COMPLETA.md`](./docs/SESION_COMPLETA.md)

## 📋 Descripción

Este proyecto implementa un contrato inteligente de pagos P2P que permite:
- **Pagar a otros usuarios**: Los pagadores pueden acreditar fondos a destinatarios
- **Retirar fondos**: Los destinatarios pueden retirar sus fondos acumulados
- **Protección contra reentrancy**: Implementación de guardia de reentrancia para seguridad

El contrato principal es `P2PPay.sol` que gestiona los balances y permite transacciones seguras entre usuarios.

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 16 (recomendado)
- **npm** o **yarn**
- **MetaMask** (extensión del navegador)
- **Ganache** (CLI o GUI) para blockchain local

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

   Variables disponibles:
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

### Iniciar los Servidores

**Terminal 1 - Fund Server** (para fondear cuentas desde Ganache):
```bash
npm run fund-server
```

El fund-server estará disponible en: **http://127.0.0.1:3001** (o el puerto configurado)

**Terminal 2 - UI Server** (interfaz de usuario):
```bash
npm run ui
```

La UI estará disponible en: **http://127.0.0.1:8080**

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start-ganache` | Inicia Ganache CLI en el puerto 8546 (alternativa a Ganache GUI) |
| `npm run build-and-export` | Compila, despliega y exporta el contrato |
| `npm run test` | Ejecuta los tests de Truffle |
| `npm run fund-server` | Inicia el servidor para fondear cuentas (ver sección detallada abajo) |
| `npm run ui` | Inicia el servidor de la interfaz de usuario |
| `npm run fund -- <address> <amount>` | Fondea una dirección desde la línea de comandos |
| `npm run export-frontend-artifact` | Exporta el artifact del contrato al frontend |

## 🎮 Uso del Fund Server (`npm run fund-server`)

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

1. **Asegúrate de que Ganache GUI esté corriendo en el puerto 7545**

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
# Si Ganache está en otro puerto (el proyecto usa 7545 por defecto)
$env:GANACHE_RPC='http://127.0.0.1:7545'
npm run fund-server
```

### Solución de Problemas

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

## 🔧 Configuración de Puertos

El proyecto está configurado para usar Ganache GUI con puertos estándar:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Ganache GUI | **7545** | Blockchain local (puerto por defecto de Ganache GUI) |
| Fund Server | 3001 | Servidor para fondear cuentas |
| UI Server | 8080 | Interfaz de usuario web |

**Nota**: El fund-server busca automáticamente Ganache en los puertos: 7545, 8546, 8545 (en ese orden).

## 🎯 Uso de la Interfaz

1. **Abrir la UI**: Navega a `http://127.0.0.1:8080`
2. **Conectar MetaMask**:
   - Asegúrate de tener MetaMask instalado
   - Agrega la red Ganache en MetaMask:
     - RPC URL: `http://127.0.0.1:7545`
     - Chain ID: `1337`
   - Importa una cuenta de Ganache (copia la clave privada desde Ganache GUI)
3. **Funcionalidades disponibles**:
   - **Conectar MetaMask**: Conecta tu wallet
   - **Selector de cuentas**: Cambia entre diferentes cuentas de MetaMask sin desconectar
   - **Enviar pago**: Envía ETH a otra dirección (usa la cuenta seleccionada)
   - **Retirar fondos**: Retira tus fondos acumulados del contrato (usa la cuenta seleccionada)
   - **Fundear mi cuenta (Ganache)**: Recibe ETH desde Ganache (requiere fund-server activo)
   - **Fundar Wallet del Proyecto**: Envía fondos a la wallet del proyecto (usa la cuenta seleccionada)

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

### Interfaz del Fund Server

El Fund Server también tiene su propia interfaz web en `http://127.0.0.1:3001` que incluye:

- **Selector de cuentas de Ganache**: Dropdown con todas las cuentas disponibles
- **Visualización de balances**: Muestra el balance de cada cuenta en tiempo real
- **Envío de fondos**: Interfaz simple para enviar ETH desde cualquier cuenta de Ganache
- **Estado de conexión**: Muestra el estado de conexión con Ganache y el RPC utilizado

**Nota**: Esta interfaz es independiente de la UI principal y está diseñada específicamente para gestionar las cuentas de Ganache.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npx truffle test tests/p2ppay.test.js --network ganache
npx truffle test tests/reentrancy.test.js --network ganache
```

## 📁 Estructura del Proyecto

```
proyecto-de-inv-op/
├── contracts/          # Contratos Solidity
│   ├── P2PPay.sol     # Contrato principal
│   └── ...
├── migrations/         # Scripts de migración/deployment
├── scripts/            # Scripts de utilidad
│   ├── fund_server.js  # Servidor para fondear cuentas
│   └── ...
├── frontend/           # Interfaz de usuario
│   ├── index.html      # UI principal
│   ├── metamask_p2p.js # Librería MetaMask
│   └── p2ppay.json     # Artifact del contrato
├── tests/              # Tests del proyecto
├── build/              # Contratos compilados
├── docs/               # Documentación adicional
├── truffle-config.js   # Configuración de Truffle
└── package.json        # Dependencias y scripts
```

## 🔐 Seguridad

El contrato `P2PPay` incluye:
- **Protección contra reentrancy**: Implementación de guardia de reentrancia
- **Validación de direcciones**: Verifica que las direcciones no sean cero
- **Validación de montos**: Verifica que los montos sean mayores a cero

## 📖 Documentación Adicional

- [Guía de Funding](./docs/funding.md) - Cómo fondear cuentas para testing

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

1. Haz clic en "Actualizar balance" después de cambiar de cuenta
2. Verifica que la cuenta seleccionada tenga fondos en el contrato
3. Asegúrate de que el contrato esté desplegado en la red correcta
4. Si usas "RPC local", desactívalo para ver el balance de MetaMask

## 📝 Notas

- Este proyecto está configurado para desarrollo local con Ganache
- Los contratos usan Solidity 0.8.17
- El proyecto soporta tanto Web3.js como Ethers.js

## 📄 Licencia

ISC

## 👤 Autor

jonas Fernandez. 29922023
Angel Salmeron. 30712504
Santiago Arrieta. 30468049
---

**¿Necesitas ayuda?** Revisa la documentación en `docs/funding.md` o los comentarios en el código.

