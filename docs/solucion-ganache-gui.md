# 🔧 Solución de Problemas: Ganache GUI

## Problema: "Not connected to child process"

Si Ganache GUI muestra el error "Not connected to child process" y los workspaces se quedan cargando indefinidamente, aquí tienes varias soluciones:

---

## ✅ Solución 1: Usar Ganache CLI (Recomendado)

Ganache CLI es más estable y no tiene problemas con OneDrive o permisos. Es la mejor alternativa.

### Pasos:

1. **Instalar Ganache CLI** (si no lo tienes):
   ```bash
   npm install -g ganache
   ```

2. **Iniciar Ganache CLI en el puerto 7545**:
   ```bash
   npx ganache -p 7545
   ```
   
   O usar el script del proyecto (usa puerto 8546, pero podemos ajustarlo):
   ```bash
   npm run start-ganache
   ```

3. **Actualizar la configuración del proyecto**:
   - Si usas puerto 8546, el proyecto ya está configurado
   - Si prefieres 7545, edita `truffle-config.js` para usar puerto 7545

4. **Configurar MetaMask**:
   - RPC URL: `http://127.0.0.1:7545` (o `8546` si usas ese puerto)
   - Chain ID: `1337`

### Ventajas de Ganache CLI:
- ✅ Más estable y confiable
- ✅ No tiene problemas con OneDrive
- ✅ No requiere interfaz gráfica
- ✅ Funciona perfectamente desde terminal
- ✅ Muestra las claves privadas directamente en la consola

---

## ✅ Solución 2: Reinstalar Ganache GUI fuera de OneDrive

Si prefieres seguir usando Ganache GUI:

1. **Desinstalar Ganache GUI completamente**

2. **Instalar en una ubicación fuera de OneDrive**:
   - Por ejemplo: `C:\Program Files\Ganache` o `C:\Ganache`
   - NO instales en `OneDrive\Escritorio` o carpetas sincronizadas

3. **Ejecutar como Administrador**:
   - Haz clic derecho en el icono de Ganache
   - Selecciona "Ejecutar como administrador"

4. **Limpiar archivos de configuración**:
   - Elimina la carpeta: `%APPDATA%\Ganache`
   - O busca en: `C:\Users\Jonas\AppData\Roaming\Ganache`

5. **Reinstalar Ganache GUI** desde cero

---

## ✅ Solución 3: Verificar Permisos y Antivirus

1. **Verificar permisos de Windows**:
   - Asegúrate de tener permisos de administrador
   - Verifica que Windows Defender no esté bloqueando Ganache

2. **Desactivar temporalmente OneDrive**:
   - Si Ganache está en OneDrive, muévelo a otra ubicación
   - O desactiva la sincronización de OneDrive temporalmente

3. **Verificar firewall**:
   - Asegúrate de que el firewall de Windows permita Ganache

---

## ✅ Solución 4: Usar Versión Más Reciente de Ganache GUI

1. **Descargar la versión más reciente**:
   - Ve a: https://github.com/trufflesuite/ganache/releases
   - Descarga la última versión estable

2. **Desinstalar la versión actual completamente**

3. **Instalar la nueva versión** fuera de OneDrive

---

## 🎯 Recomendación Final

**Usa Ganache CLI** - Es la solución más rápida y confiable:

```bash
# Iniciar Ganache CLI en puerto 7545
npx ganache -p 7545

# O usar el script del proyecto (puerto 8546)
npm run start-ganache
```

Luego actualiza `truffle-config.js` si es necesario para que coincida con el puerto que uses.

---

## 📝 Notas Adicionales

- El proyecto está configurado para funcionar con ambos (Ganache GUI en 7545 o CLI en 8546)
- Puedes cambiar el puerto en `truffle-config.js` según lo que uses
- El fund-server detecta automáticamente en ambos puertos (7545, 8546, 8545)
