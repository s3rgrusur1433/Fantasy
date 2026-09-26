# Fantasy LaLiga

Fantasy privado para jugar con amigos usando exclusivamente jugadores de LaLiga EA Sports.

## Incluye
- Registro/login demo local para prototipo.
- Creación de equipo con plantilla aleatoria.
- 11 titular obligatorio.
- Solo los 11 titulares suman puntos.
- Clasificación por puntos acumulados.
- Mercado de jugadores.
- Subastas con contador.
- Panel de administrador para puntos y jugadores.
- Fotos de jugadores mediante URLs configurables.
- Datos persistidos en localStorage en esta primera versión.

## Ejecutar
```bash
npm install
npm run dev
```

Después abre http://localhost:3000

## Siguiente paso
Para jugar realmente entre varios dispositivos hay que conectar una base de datos/autenticación (recomendado: Supabase) y sustituir el almacenamiento local por tablas y eventos en tiempo real.
