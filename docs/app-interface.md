# Guía de Uso - Interfaz P2P Pay

Esta guía explica cómo usar la nueva interfaz de la aplicación P2P Pay.

## 🚀 Inicio Rápido

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

## 📱 Secciones de la Aplicación

### 1. 🔐 Inicio de Sesión

La primera vista que verás al abrir la aplicación.

**Funcionalidades:**
- **Conectar MetaMask**: Haz clic en el botón "Conectar MetaMask" para conectar tu billetera
- **Selector de Cuentas**: Una vez conectado, puedes seleccionar entre diferentes cuentas de MetaMask
- **Información de Cuenta**: Se muestra la cuenta actualmente seleccionada

**Requisitos:**
- MetaMask debe estar instalado en tu navegador
- MetaMask debe estar configurado con la red Ganache (RPC: `http://127.0.0.1:8546`, Chain ID: `1337`)
- Al menos una cuenta debe estar importada en MetaMask

### 2. 💰 Billetera

Vista principal para gestionar tu billetera.

**Información Mostrada:**
- **Balance Total**: Muestra la suma de tu balance de ETH y el balance en el contrato
- **Dirección**: Tu dirección de billetera actual

**Acciones Disponibles:**

#### 📤 Enviar
- Permite enviar ETH a otra dirección usando el contrato P2PPay
- Campos requeridos:
  - **Dirección destino**: Dirección Ethereum válida (0x...)
  - **Cantidad**: Cantidad en ETH a enviar
  - **Referencia** (opcional): Texto de referencia para la transacción (máx. 32 caracteres)

#### 📥 Recibir
- Muestra tu dirección de billetera para que otros puedan enviarte fondos
- Incluye botón para copiar la dirección al portapapeles
- La dirección se puede compartir con otros usuarios

#### 💸 Retirar
- Permite retirar fondos que tienes depositados en el contrato P2PPay
- Muestra tu balance actual en el contrato
- Retira todos los fondos disponibles en el contrato

### 3. 💬 Modo P2P

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

## 🔄 Flujo de Trabajo Típico

### Escenario 1: Enviar Dinero a Otro Usuario
1. Conecta tu billetera (Inicio de Sesión)
2. Ve a "Billetera"
3. Haz clic en "Enviar"
4. Ingresa la dirección destino y cantidad
5. Confirma la transacción en MetaMask
6. Espera la confirmación

### Escenario 2: Recibir Dinero
1. Conecta tu billetera
2. Ve a "Billetera"
3. Haz clic en "Recibir"
4. Copia tu dirección y compártela con quien te enviará dinero
5. Espera a recibir la transacción

### Escenario 3: Retirar Fondos del Contrato
1. Conecta tu billetera
2. Ve a "Billetera"
3. Haz clic en "Retirar"
4. Verifica tu balance en el contrato
5. Haz clic en "Retirar Todo"
6. Confirma en MetaMask

### Escenario 4: Transacción P2P entre Dos Cuentas
1. Conecta tu billetera
2. Ve a "Modo P2P"
3. Selecciona dos cuentas diferentes (Usuario 1 y Usuario 2)
4. Configura la transacción (origen, destino, cantidad)
5. Envía la transacción
6. MetaMask puede solicitar cambiar de cuenta
7. Confirma la transacción

## ⚠️ Solución de Problemas

### MetaMask no se conecta
- Verifica que MetaMask esté instalado
- Asegúrate de que la red Ganache esté configurada correctamente
- Verifica que Ganache esté corriendo

### No aparecen cuentas
- Asegúrate de tener al menos una cuenta en MetaMask
- Verifica que MetaMask esté desbloqueado
- Intenta recargar la página

### Error al enviar transacción
- Verifica que tengas suficiente ETH para la transacción y el gas
- Asegúrate de que la dirección destino sea válida
- Verifica que el contrato esté desplegado

### Balance muestra 0
- El balance mostrado es la suma de ETH de la cuenta + balance en el contrato
- Si no has depositado en el contrato, el balance del contrato será 0
- Usa "Enviar" para depositar fondos en el contrato

### Modo P2P no funciona
- Asegúrate de seleccionar dos cuentas diferentes
- Verifica que ambas cuentas tengan fondos suficientes
- MetaMask puede solicitar cambiar de cuenta manualmente

## 📝 Notas Técnicas

- Todas las transacciones se realizan a través del contrato P2PPay
- Los fondos enviados se depositan en el contrato, no se transfieren directamente
- Para retirar fondos del contrato, usa la función "Retirar"
- El balance mostrado incluye tanto ETH de la cuenta como fondos en el contrato
- Las referencias están limitadas a 32 caracteres (bytes32)

## 🎯 Próximos Pasos

Para usar la aplicación:
1. Asegúrate de tener Ganache corriendo
2. Despliega el contrato si es necesario
3. Inicia el servidor UI
4. Abre `app.html` en tu navegador
5. ¡Comienza a usar P2P Pay!
