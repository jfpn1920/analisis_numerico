const CLAVE = "analisis-numerico";           // clave con la que se guarda en localStorage
const EJEMPLO = "12, 15, 9, 22, 18, 30, 11"; // lista del botón "Usar ejemplo"
// Referencias a los elementos de la página
const entrada = document.getElementById("numeros"); // campo de texto
const mensaje = document.getElementById("mensaje"); // zona de avisos
const barras = document.getElementById("barras");   // contenedor de la gráfica
const salidas = {                                   // lugares donde se muestran los tres resultados
    media: document.getElementById("media"),
    mediana: document.getElementById("mediana"),
    desviacion: document.getElementById("desviacion"),
};
// Media: suma de todos los datos dividida entre la cantidad
const calcularMedia = (datos) => datos.reduce((acc, n) => acc + n, 0) / datos.length;
// Mediana: valor central de los datos ordenados (si son pares, promedio de los dos centrales)
function calcularMediana(datos) {
    const orden = [...datos].sort((a, b) => a - b); // copia ordenada de menor a mayor
    const medio = Math.floor(orden.length / 2);
    return orden.length % 2 === 0 ? (orden[medio - 1] + orden[medio]) / 2 : orden[medio];
}
// Desviación estándar: raíz de la media de los cuadrados de (dato - media)
function calcularDesviacion(datos) {
    const media = calcularMedia(datos);
    return Math.sqrt(calcularMedia(datos.map((n) => (n - media) ** 2)));
}
// Convierte el texto escrito en números y separa los que no son válidos
function leerNumeros(texto) {
    const partes = texto.split(/[\s,;]+/).filter(Boolean); // separa por comas, espacios o ;
    const datos = partes.map(Number);
    const invalidos = partes.filter((_, i) => Number.isNaN(datos[i]));
    return { datos, invalidos };
}
// Da formato numérico (máximo 4 decimales)
const formatear = (valor) => valor.toLocaleString("es-CO", { maximumFractionDigits: 4 });
// Muestra un aviso; si es un error, se pinta en rojo
function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("error", esError);
}
// Deja los resultados y la gráfica vacíos
function limpiarResultados() {
    Object.values(salidas).forEach((el) => { el.textContent = "—"; });
    barras.replaceChildren();
}
// Dibuja una barra por cada número, proporcional al valor más grande
function dibujarBarras(datos) {
    const maximo = Math.max(...datos.map((n) => Math.abs(n))) || 1;
    barras.replaceChildren(...datos.map((n) => {
        const barra = document.createElement("div");
        barra.className = "barra";
        barra.style.height = `${Math.max((Math.abs(n) / maximo) * 100, 3)}%`;
        barra.title = formatear(n); // al pasar el mouse se ve el valor
        return barra;
    }));
}
// Lee los datos, calcula los tres valores y actualiza la pantalla
function calcular() {
    const { datos, invalidos } = leerNumeros(entrada.value);
    if (datos.length === 0) {          // todavía no hay datos
        limpiarResultados();
        avisar("Escribe al menos un número para empezar.", false);
    } else if (invalidos.length > 0) { // hay texto que no es un número
        limpiarResultados();
        avisar(`No es un número válido: ${invalidos.join(", ")}`, true);
    } else {                           // todo correcto: se muestran los resultados
        salidas.media.textContent = formatear(calcularMedia(datos));
        salidas.mediana.textContent = formatear(calcularMediana(datos));
        salidas.desviacion.textContent = formatear(calcularDesviacion(datos));
        dibujarBarras(datos);
        avisar(`Calculado con ${datos.length} valores.`, false);
    }
    guardar(); // se guarda lo escrito cada vez que se calcula
}
// Guarda el texto (try/catch por si el navegador bloquea el almacenamiento)
function guardar() { try { localStorage.setItem(CLAVE, entrada.value); } catch (e) { console.warn("No se pudo guardar:", e); } }
// Recupera el texto guardado y recalcula al abrir o refrescar la página
function cargar() {
    try { const g = localStorage.getItem(CLAVE); if (g !== null) entrada.value = g; } catch (e) { console.warn("No se pudo leer:", e); }
    calcular();
}
// Eventos
entrada.addEventListener("input", calcular); // recalcula y guarda mientras se escribe
document.getElementById("calcular").addEventListener("click", calcular); // botón Calcular
// Botón Usar ejemplo: pone la lista de ejemplo y calcula
document.getElementById("ejemplo").addEventListener("click", () => { entrada.value = EJEMPLO; calcular(); });
// Botón Borrar datos: vacía el campo; calcular() también actualiza lo guardado
document.getElementById("limpiar").addEventListener("click", () => { entrada.value = ""; calcular(); entrada.focus(); });
// Al terminar de cargar la página se recuperan los datos guardados
document.addEventListener("DOMContentLoaded", cargar);