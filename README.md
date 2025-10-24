# partidas-excel

Aplicación Vite + React para subir un archivo Excel (.xlsx / .xls) y mantener los datos en memoria (estado de React).

Instrucciones (Windows, pwsh):

1. Instalar dependencias:

```powershell
npm install
```

2. Ejecutar servidor de desarrollo:

```powershell
npm run dev
```

3. Abrir la app en el navegador (la salida del comando mostrará la URL, normalmente http://localhost:5173).

4. Usar el input para seleccionar un archivo .xlsx. Los datos se parsean con SheetJS (xlsx) y se muestran en memoria.
