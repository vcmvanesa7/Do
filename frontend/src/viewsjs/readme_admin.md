<<<<<<< HEAD
# Proyecto Admin Dashboard - API & Dashboard

## **1. Endpoints de Courses**

| Método | Endpoint              | Autenticación | Rol requerido | Descripción                 |
| ------ | --------------------- | ------------- | ------------- | --------------------------- |
| GET    | `/courses`            | Sí            | user/admin    | Obtener todos los cursos    |
| GET    | `/courses/:id_course` | Sí            | user/admin    | Obtener un curso específico |
| POST   | `/courses`            | Sí            | admin         | Crear un nuevo curso        |
| PUT    | `/courses/:id_course` | Sí            | admin         | Actualizar un curso         |
| DELETE | `/courses/:id_course` | Sí            | admin         | Eliminar un curso           |

**Ejemplo body POST/PUT (JSON)**

```json
{
  "name": "Curso de JavaScript",
  "description": "Curso completo de JS moderno"
}
```

---

## **2. Endpoints de Levels**

| Método | Endpoint            | Autenticación | Rol requerido | Descripción                 |
| ------ | ------------------- | ------------- | ------------- | --------------------------- |
| GET    | `/levels`           | Sí            | user/admin    | Obtener todos los niveles   |
| GET    | `/levels/:id_level` | Sí            | user/admin    | Obtener un nivel específico |
| POST   | `/levels`           | Sí            | admin         | Crear un nuevo nivel        |
| PUT    | `/levels/:id_level` | Sí            | admin         | Actualizar un nivel         |
| DELETE | `/levels/:id_level` | Sí            | admin         | Eliminar un nivel           |

**Ejemplo body POST/PUT (JSON)**

```json
{
  "name": "Nivel Básico",
  "description": "Introducción a JavaScript",
  "step": 1,
  "id_courses": 1
}
```

---

## **3. Autenticación**

1. Endpoint `/auth/login` para obtener JWT:

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

2. Copiar el token JWT y usarlo en **Headers** para los endpoints que requieren autenticación:

```
Authorization: Bearer <TU_TOKEN_JWT>
Content-Type: application/json
```

---

## **4. DashboardAdmin (SPA)**

* Menú lateral fijo con **Cursos** y **Niveles**.
* Al hacer click en cada módulo:

1. **Cursos:** se muestra un formulario para agregar cursos y una lista con botones de **editar** y **eliminar**.
2. **Niveles:** se muestra un formulario para agregar niveles (nombre, descripción, step, curso asociado) y lista con botones de **editar** y **eliminar**.

* Cada botón `<a>` usa `data-link` y `data-action` para capturar la acción y enviar los datos al backend mediante la API (`src/services/api.js`).

* Funcionalidades incluidas:

  * **Agregar Curso/Nivel** → `POST` al backend.
  * **Editar Curso/Nivel** → `PUT` al backend.
  * **Eliminar Curso/Nivel** → `DELETE` al backend.
  * **Listar Cursos/Niveles** → `GET` al backend.

* Todo el contenido dinámico se carga dentro del contenedor principal (`#admin-content`) sin recargar la página, usando lógica SPA.

---

## **5. Uso en Postman**

1. Hacer login para obtener token.
2. Agregar `Authorization: Bearer <token>` en los Headers.
3. Probar los endpoints según rol (`admin` para POST/PUT/DELETE, `user` para GET).
4. Revisar los JSON de request y response para validar.
=======
# Proyecto Admin Dashboard - API & Dashboard

## **1. Endpoints de Courses**

| Método | Endpoint              | Autenticación | Rol requerido | Descripción                 |
| ------ | --------------------- | ------------- | ------------- | --------------------------- |
| GET    | `/courses`            | Sí            | user/admin    | Obtener todos los cursos    |
| GET    | `/courses/:id_course` | Sí            | user/admin    | Obtener un curso específico |
| POST   | `/courses`            | Sí            | admin         | Crear un nuevo curso        |
| PUT    | `/courses/:id_course` | Sí            | admin         | Actualizar un curso         |
| DELETE | `/courses/:id_course` | Sí            | admin         | Eliminar un curso           |

**Ejemplo body POST/PUT (JSON)**

```json
{
  "name": "Curso de JavaScript",
  "description": "Curso completo de JS moderno"
}
```

---

## **2. Endpoints de Levels**

| Método | Endpoint            | Autenticación | Rol requerido | Descripción                 |
| ------ | ------------------- | ------------- | ------------- | --------------------------- |
| GET    | `/levels`           | Sí            | user/admin    | Obtener todos los niveles   |
| GET    | `/levels/:id_level` | Sí            | user/admin    | Obtener un nivel específico |
| POST   | `/levels`           | Sí            | admin         | Crear un nuevo nivel        |
| PUT    | `/levels/:id_level` | Sí            | admin         | Actualizar un nivel         |
| DELETE | `/levels/:id_level` | Sí            | admin         | Eliminar un nivel           |

**Ejemplo body POST/PUT (JSON)**

```json
{
  "name": "Nivel Básico",
  "description": "Introducción a JavaScript",
  "step": 1,
  "id_courses": 1
}
```

---

## **3. Autenticación**

1. Endpoint `/auth/login` para obtener JWT:

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

2. Copiar el token JWT y usarlo en **Headers** para los endpoints que requieren autenticación:

```
Authorization: Bearer <TU_TOKEN_JWT>
Content-Type: application/json
```

---

## **4. DashboardAdmin (SPA)**

* Menú lateral fijo con **Cursos** y **Niveles**.
* Al hacer click en cada módulo:

1. **Cursos:** se muestra un formulario para agregar cursos y una lista con botones de **editar** y **eliminar**.
2. **Niveles:** se muestra un formulario para agregar niveles (nombre, descripción, step, curso asociado) y lista con botones de **editar** y **eliminar**.

* Cada botón `<a>` usa `data-link` y `data-action` para capturar la acción y enviar los datos al backend mediante la API (`src/services/api.js`).

* Funcionalidades incluidas:

  * **Agregar Curso/Nivel** → `POST` al backend.
  * **Editar Curso/Nivel** → `PUT` al backend.
  * **Eliminar Curso/Nivel** → `DELETE` al backend.
  * **Listar Cursos/Niveles** → `GET` al backend.

* Todo el contenido dinámico se carga dentro del contenedor principal (`#admin-content`) sin recargar la página, usando lógica SPA.

---

## **5. Uso en Postman**

1. Hacer login para obtener token.
2. Agregar `Authorization: Bearer <token>` en los Headers.
3. Probar los endpoints según rol (`admin` para POST/PUT/DELETE, `user` para GET).
4. Revisar los JSON de request y response para validar.
>>>>>>> Juanda
