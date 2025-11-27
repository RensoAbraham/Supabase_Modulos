# 📚 DOCUMENTACIÓN DE ENDPOINTS SERVERLESS (MÓDULO 4)

Estos endpoints Serverless (Edge Functions) reemplazan las llamadas directas a INSERT/RPC de PostgREST y centralizan la seguridad y la lógica transaccional.

**Header Requerido para TODAS las peticiones:**
| Header | Valor | Propósito |
| :--- | :--- | :--- |
| `Authorization` | `Bearer [JWT_TOKEN_DEL_USUARIO]` | Requerido para validar sesión y obtener el `user_id` para RLS. |

---

## 1. POST /registrar_venta

Registra una venta completa (cabecera y detalle) en una sola transacción.

| Propiedad | Valor |
| :--- | :--- |
| **URL Final** | `[SUPABASE_URL]/functions/v1/registrar_venta` |
| **Método** | `POST` |

### A. Body Esperado (JSON)

```json
{
    "payment_method": "efectivo", // (payment_method_type ENUM)
    "items": [
        {
            "product_id": 1,
            "quantity": 1.500,
            "unit_price": 4.50
        },
        {
            "product_id": 2,
            "quantity": 0.500,
            "unit_price": 10.00
        }
    ]
}