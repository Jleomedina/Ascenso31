# Ascenso 31

Una página web local para convertir el cumplimiento de un objetivo en una ruta de 31 niveles, siguiendo exactamente la secuencia de rangos solicitada.

## Abrir la página

Haz doble clic en **index.html**. Funciona sin instalación, sin conexión y sin servidor. Usa siempre el mismo navegador y la misma ubicación de la carpeta para conservar acceso al progreso guardado.

## Editar en Visual Studio

1. Abre Visual Studio.
2. Elige **Archivo → Abrir → Carpeta** y selecciona **Ascenso31**.
3. Edita `index.html`, `styles.css` o `app.js`.
4. Guarda los cambios y actualiza la página en el navegador.

También puedes abrir esta carpeta en Visual Studio Code. No necesitas extensiones ni paquetes.

## Cómo funciona

- Define tu objetivo diario.
- Al final del día, indica si lo cumpliste.
- Cada día consecutivo cumplido suma un nivel, hasta 31. Los rangos repetidos se mantienen exactamente como en la tabla original.
- Un día sin cumplir rompe la racha y reinicia el rango desde cero. El historial conserva tus intentos anteriores.
- La racha cuenta días consecutivos cumplidos. Hoy puede estar pendiente sin perder la racha de ayer. Los días omitidos rompen la racha y reinician el rango cuando ya han pasado. Puedes registrar una fecha olvidada para corregirlo.
- Solo se permite un resultado por fecha. Puedes corregirlo y registrar fechas olvidadas desde el inicio de la misión hasta hoy. No puedes registrar fechas futuras.
- Al completar un nivel aparece una animación. «Ver animación» muestra una vista previa sin modificar el progreso.
- Puedes seguir registrando días después de llegar a General.
- El progreso se guarda en el almacenamiento local del navegador. No hay cuentas ni sincronización entre dispositivos. Si borras los datos del navegador, también se elimina el progreso. Los modos privados pueden descartarlo al cerrar.
- «Reiniciar misión» pide confirmación y borra los registros y el objetivo.
- La fecha se calcula con la zona horaria local de tu dispositivo. Mantén su reloj correcto.

## Archivos

- `index.html`: estructura y diálogos.
- `styles.css`: diseño adaptable, colores y animaciones; respeta la preferencia de reducir movimiento.
- `progress.js`: tabla de rangos y cálculo del progreso.
- `app.js`: controles, registros y guardado local.

Esta es una simulación motivacional con la escala indicada por el usuario. No representa una carrera ni un sistema oficial de ascensos militares.
