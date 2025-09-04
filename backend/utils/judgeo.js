import { spawn } from "child_process";

/**
 * Ejecuta código en Python con soporte para stdin
 * @param {string} language - Lenguaje del código (solo se admite 'python')
 * @param {string} source_code - Código fuente a ejecutar
 * @param {string} stdin - Entrada estándar opcional
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
export async function runCode(language, source_code, stdin = "") {
    return new Promise((resolve) => {
        if (language !== "python") {
            return resolve({
                stdout: "",
                stderr: "⚠️ Solo se admite Python en esta versión",
                exitCode: 1,
            });
        }

        // 👇 Aquí ejecutamos python3 con el código recibido
        const process = spawn("python3", ["-c", source_code]);

        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("close", (code) => {
            resolve({
                stdout,
                stderr,
                exitCode: code,
            });
        });

        // Si el ejercicio espera entrada por stdin
        if (stdin) {
            process.stdin.write(stdin);
            process.stdin.end();
        }
    });
}
