# Cambios necesarios en Frontend para Sistema de Estados de Eventos

## Resumen
El backend ahora soporta estados automáticos para eventos basados en fechas: **próximo**, **activo**, y **finalizado**.

---

## 📋 Cambios en Admin Dashboard

### 1. Formulario de Crear Evento

#### Campos a agregar/modificar:

**Campos actuales:**
- `title` (text) ✅
- `content` (textarea) ✅
- `image` (file upload) ✅
- `link_ev` (url) ✅
- `published_at` (datetime) ✅

**NUEVO CAMPO:**
- `end_date` (datetime) ⭐ NUEVO - Opcional

#### Validaciones del lado del cliente:
- Validar que `end_date` sea posterior o igual a `published_at`
- Mostrar error si `end_date < published_at`

#### Request POST actualizado:
**Endpoint:** `POST /api/event/`

**Body (FormData):**
- `title` (requerido)
- `content` (requerido)
- `published_at` (requerido)
- `end_date` ⭐ NUEVO (opcional)
- `link_ev` (opcional)
- `image` (file, opcional)

---

### 2. Formulario de Editar Evento

#### Cambios:
- Agregar campo `end_date` (datetime, opcional)
- Mismas validaciones que en crear evento

#### Request PUT actualizado:
**Endpoint:** `PUT /api/event/:id`

**Body (FormData):**
- `title` (requerido)
- `content` (requerido)
- `published_at` (requerido)
- `end_date` ⭐ NUEVO (opcional)
- `link_ev` (opcional)
- `image` (file, opcional)

---

### 3. Lista de Eventos (Admin)

#### Cambios a realizar:

**a) Mostrar badge/chip de estado:**
- Cada evento ahora incluye campo `status` calculado automáticamente
- Valores posibles: `'proximo'`, `'activo'`, `'finalizado'`
- Mostrar badge visual con color según estado:
  - **Próximo**: azul/info
  - **Activo**: verde/success
  - **Finalizado**: gris/secondary

**b) Agregar filtros por estado:**
- Botones o dropdown para filtrar
- Opciones: Todos, Próximos, Activos, Finalizados
- Request al API:
  - Sin filtro: `GET /api/event/`
  - Con filtro: `GET /api/event/?status=activo`

**c) Mostrar fechas en la tabla:**
- Agregar columnas:
  - Fecha de Inicio (`published_at`)
  - Fecha de Fin (`end_date`)
  - Estado (badge visual)
- Si `end_date` es `null`, mostrar "Sin límite" o similar

**d) Formateo de fechas:**
- Formato recomendado: `DD/MM/YYYY HH:mm` o según preferencia local

---

## 📱 Cambios en App de Usuario (Mobile/Web)

### 1. Lista de Eventos

#### Cambios a realizar:

**a) Filtrar eventos finalizados:**
- **Opción 1 (Recomendada)**: Solo mostrar eventos próximos y activos
  - Request: `GET /api/event/?status=activo` o filtrar en frontend
- **Opción 2**: Mostrar todos pero separar en secciones
  - "Eventos Actuales" vs "Eventos Pasados"

**b) Indicador visual de estado:**
- Mostrar badge o chip discreto según estado:
  - **Próximo**: "Próximamente" (azul)
  - **Activo**: "En curso" (verde)
  - **Finalizado**: no mostrar o "Finalizado" (gris)

**c) Mostrar fechas relevantes:**
- Para eventos **próximos**: Mostrar fecha de inicio
- Para eventos **activos**: Mostrar fecha de fin (si existe)
- Para eventos **finalizados**: Opcional mostrar fecha de finalización

**d) Countdown para eventos próximos (opcional):**
- Mostrar tiempo restante hasta que comience
- Formato: "Comienza en: 2d 5h 30m"

**e) Sección de eventos pasados (opcional):**
- Botón "Ver eventos pasados"
- Mostrar lista colapsable con eventos finalizados

---

## 🔄 Respuesta del API actualizada

### Endpoints disponibles:

**1. Obtener todos los eventos:**
```
GET /api/event/
```

**2. Filtrar por estado:**
```
GET /api/event/?status=proximo
GET /api/event/?status=activo
GET /api/event/?status=finalizado
```

### Estructura de respuesta:

```json
[
  {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "image_url": "string | null",
    "link_ev": "string | null",
    "published_at": "ISO 8601 string",
    "end_date": "ISO 8601 string | null",
    "status": "proximo | activo | finalizado"  // ⭐ NUEVO
  }
]
```

**Campo `status` (calculado automáticamente):**
- **'proximo'**: El evento aún no ha comenzado (`NOW() < published_at`)
- **'activo'**: El evento está en curso (`NOW() >= published_at AND (end_date IS NULL OR NOW() <= end_date)`)
- **'finalizado'**: El evento ya terminó (`NOW() > end_date`)

---

## 📝 Checklist de Implementación

### ✅ Admin Dashboard:
- [ ] Agregar campo `end_date` en formulario de crear evento
- [ ] Agregar campo `end_date` en formulario de editar evento
- [ ] Validar que `end_date >= published_at` antes de enviar
- [ ] Mostrar badge de estado en lista/tabla de eventos
- [ ] Agregar botones/dropdown de filtro por estado
- [ ] Agregar columnas de fechas en tabla de eventos
- [ ] Actualizar requests POST/PUT para incluir `end_date`

### ✅ App de Usuario:
- [ ] Mostrar badge de estado en cards de eventos
- [ ] Filtrar o separar eventos finalizados
- [ ] Mostrar fechas relevantes según el estado del evento
- [ ] (Opcional) Agregar countdown para eventos próximos
- [ ] (Opcional) Sección colapsable de eventos pasados
- [ ] Actualizar UI según diseño de la app

---

## 🎨 Sugerencias de UX

### Para Admin:
- Usar colores distintos para cada estado
- Ordenar por defecto: activos → próximos → finalizados
- Mostrar total de eventos por estado en los filtros
- Destacar visualmente eventos que están por finalizar (ej: quedan menos de 24h)

### Para Usuario:
- Destacar eventos activos sobre próximos
- Ocultar eventos finalizados por defecto
- Mostrar countdown visual para eventos próximos
- Usar iconos para reforzar el estado (📅 = próximo, ✅ = activo, 🏁 = finalizado)
- (Opcional) Notificaciones push cuando un evento próximo se vuelve activo

---

## ⚠️ Notas Importantes

1. **Campo `end_date` es OPCIONAL**: Si no se especifica, el evento permanecerá "activo" indefinidamente después de `published_at`

2. **Campo `status` es CALCULADO**: No se envía al backend, se calcula automáticamente según las fechas

3. **Compatibilidad**: Eventos existentes sin `end_date` seguirán funcionando (serán "activos" después de `published_at`)

4. **Zona horaria**: Manejar correctamente las zonas horarias en inputs de tipo datetime

5. **Formato de fechas**: El backend espera formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

6. **Estados posibles**:
   - `'proximo'` - Evento no ha comenzado
   - `'activo'` - Evento en curso o sin fecha de fin
   - `'finalizado'` - Evento ya terminó

---

## 🐛 Manejo de Errores

### Error 400 - Fechas inválidas:
```json
{
  "error": "La fecha de finalización no puede ser anterior a la fecha de publicación"
}
```
**Acción**: Mostrar mensaje de error y resaltar campos de fecha.

### Error 400 - Status inválido en filtro:
```json
{
  "error": "Estado no válido. Usa: proximo, activo o finalizado"
}
```
**Acción**: Validar valores del filtro antes de hacer la request.

---

## 📊 Lógica de Estados (Referencia)

```
Línea de tiempo del evento:

    published_at              end_date
         |                        |
         v                        v
---------|========================|------------>
         ^                        ^
      PRÓXIMO     ACTIVO      FINALIZADO

- Antes de published_at → PRÓXIMO
- Entre published_at y end_date → ACTIVO
- Después de end_date → FINALIZADO
- Si no hay end_date → ACTIVO indefinidamente
```

---

## 🔗 Endpoints Resumen

| Método | Endpoint | Cambios |
|--------|----------|---------|
| GET | `/api/event/` | Ahora incluye campo `status` en respuesta |
| GET | `/api/event/?status=activo` | ⭐ NUEVO filtro por estado |
| POST | `/api/event/` | Ahora acepta campo `end_date` (opcional) |
| PUT | `/api/event/:id` | Ahora acepta campo `end_date` (opcional) |
| DELETE | `/api/event/:id` | Sin cambios |
