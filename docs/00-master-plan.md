# Plan Maestro: BYTEK CORE (ERP + CRM + PSA)

## Visión General
Desarrollar un "Sistema de Gestión Total" híbrido que controle, de extremo a extremo, las 3 unidades de negocio de **BYTEK S.A.C.S.** ("Soluciones 360°: Infraestructura, Software y Estrategia Digital"). El sistema actuará como la columna vertebral operativa, financiera y comercial.

---

## 🏗️ Arquitectura de Módulos (El "BYTEK Core")

### 1. Módulo CRM y Cotizador Multidimensional (Ventas)
- **Pipelines Diferenciados por Unidad:**
  - *Pipeline Volumétrico:* Para Paquetes Digitales (Ventas rápidas de Landing Pages, 7 días).
  - *Pipeline Consultivo:* Para Software a Medida (Reuniones, análisis, cotizaciones complejas).
- **Cotizador Híbrido Avanzado:**
  - Capaz de presupuestar *Productos Físicos* (NAS, Routers), *Servicios* (Horas de desarrollo/instalación) y *Suscripciones* (SaaS, Mantenimiento).
- **Generación Automática de Contratos:** Plantillas PDF parametrizadas para bloquear alcance (vital para la U2).

### 2. Módulo de Operaciones y Delivery (PSA)
- **Gestión Ágil (U1):** Tableros Kanban para diseño web, SEO, campañas y despliegue rápido.
- **Gestión por Hitos (U2):** Control estricto de proyectos de software (ej. 30% diseño, 30% desarrollo, 40% entrega). Vinculado a aprobación de cliente.
- **Field Service Management (U3):** Programación de técnicos en campo, check-ins, actas de conformidad digitales con fotos y captura de números de serie (S/N) de hardware instalado.

### 3. Módulo de Finanzas y Facturación (PE)
- **Motor de Recurrencias:** Automatización de cobros (Convex Crons) integrados a Izipay/Niubiz para mantenimientos y SaaS.
- **Control de Hitos de Pago:** Alarmas y bloqueo administrativo para pagos fraccionados (30-30-40).
- **Emisión Electrónica SUNAT:** Generación automática de boletas/facturas API conectada a SUNAT.

### 4. Módulo de Inventario y Logística
- **Control de Almacén:** Stock de hardware (APs, Cabinas, NAS, Cajas UTP).
- **Trazabilidad y Garantías (RMA):** Registro del hardware instalado por cliente y número de serie para agilizar garantías de fábrica o internas.

### 5. Módulo de Customer Success (Portal Cliente)
- **Self-Service:** Portal donde el cliente ve el avance de sus proyectos (software o web), paga facturas pendientes o descarga entregables (ej. manuales de recuperación o actas).
- **Helpdesk Integrado (SLAs):** Sistema de tickets clasificados por urgencia (Ej. Caída de servidor NAS vs Cambio de texto en web).

---

## 🚀 Plan de Implementación por Fases

Para asegurar la salida a producción temprana y no ahogarnos en un desarrollo de años, el sistema se construirá iterativamente:

### Fase 1: MVP Comercial (Alpha) - "Que fluya el dinero"
**Objetivo:** Sistematizar las ventas y organizar la oferta.
- Catálogo central de servicios (Las 3 Unidades + Nichos).
- Módulo CRM básico (Leads y Pipelines).
- Motor de Cotizaciones Híbrido (PDFs de presupuestos automatizados).
- Base de datos de Clientes y Usuarios.

### Fase 2: Control Operativo y Financiero (Beta) - "Orden en la casa"
**Objetivo:** Ejecutar lo vendido sin perder rentabilidad ni control.
- Módulo de Proyectos (Kanban U1 e Hitos U2).
- Módulo de Facturación y Pasarela de Pagos (Cobros recurrentes y facturación electrónica).
- Portal de Cliente (Vista simple de estado de deudas y proyectos).

### Fase 3: Infraestructura y Escalado (Gamma) - "Despliegue Físico"
**Objetivo:** Cubrir las particularidades de la Unidad 3 (Hardware).
- Módulo de Inventario y Garantías.
- Aplicación Móvil (React Native) para Field Service (Técnicos).
- Generación de Actas de Conformidad (Firmas digitales e imágenes).
- Integración final del Helpdesk (Tickets de soporte).

### Fase 4: Integraciones Nicho (Delta) - "El Ecosistema Vivo"
**Objetivo:** Conectar productos satélite al Core.
- Integración de API de Reloj Biométrico Web (Demo in-house).
- Dashboards de analítica avanza para rentabilidad por unidad.

---

## 💡 Estrategia "Eat Your Own Dog Food"
BYTEK debe utilizar internamente sus propios servicios Nicho como demostración viva de capacidad técnica:
1. **Control Biométrico:** El módulo de RRHH de este ERP usará la misma tecnología de reloj web que se le vende a los clientes.
2. **Disaster Recovery:** La base de datos y archivos del BYTEK Core tendrán los mismos protocolos automáticos de backup que se ofrecen en las consultorías de Ciberseguridad/Infra.
3. **API Integrator:** Los "Crons" de Convex funcionarán como el middleware perfecto para conectar pasarelas, ERP y WhatsApp, siendo el portafolio perfecto de la U2.
