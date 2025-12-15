# Configuración Automática del Contrato

La aplicación P2P Pay ahora puede detectar automáticamente la dirección del contrato desde múltiples fuentes, permitiendo que funcione desde cualquier URL sin configuración manual.

## 🔍 Fuentes de Detección (en orden de prioridad)

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

## 🛠️ Configuración Manual

Si necesitas usar un contrato diferente al detectado automáticamente:

### Opción 1: Parámetro de URL
```
http://localhost:8080/app.html?contract=0xTU_DIRECCION_AQUI
```

### Opción 2: Desde la Interfaz
1. Abre la aplicación
2. En la vista de "Inicio de Sesión", expande "⚙️ Configuración avanzada (Contrato)"
3. Ingresa la dirección del contrato
4. Haz clic en "Configurar Contrato"

### Opción 3: LocalStorage (desde consola del navegador)
```javascript
localStorage.setItem('p2ppay_contract_info', JSON.stringify({
  address: '0xTU_DIRECCION_AQUI',
  abi: [...], // ABI del contrato
  networkId: null,
  projectWallet: null
}))
```

## 📝 Notas

- La aplicación guarda automáticamente la configuración en `localStorage` para futuras cargas
- Si el contrato se detecta desde la URL, tiene prioridad sobre otras fuentes
- El ABI se obtiene automáticamente desde el build artifact si está disponible
- Si no se encuentra el ABI, se usa un ABI por defecto con las funciones básicas del contrato P2PPay

## 🔄 Actualizar Contrato

Para cambiar el contrato después de haberlo configurado:

1. **Desde URL**: Agrega el parámetro `?contract=0xNUEVA_DIRECCION`
2. **Desde UI**: Usa el campo de configuración avanzada
3. **Limpiar localStorage**: 
   ```javascript
   localStorage.removeItem('p2ppay_contract_info')
   ```
   Luego recarga la página

## ✅ Verificación

Para verificar qué contrato está siendo usado:

1. Abre la consola del navegador (F12)
2. Busca el mensaje: `✅ Contrato configurado: 0x...`
3. O revisa el elemento `#contractInfo` en la vista de login
