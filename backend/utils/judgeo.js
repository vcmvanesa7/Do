import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;

// Mapa de lenguajes soportados por Judge0
const langMap = {
    python: 71,
    javascript: 63,
    cpp: 54,
    java: 62
};

export async function runCode({ language = "python", source, stdin = "" }) {
    const language_id = langMap[language] || 71;

    const res = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
            language_id,
            source_code: source,
            stdin
        },
        {
            headers: {
                "X-RapidAPI-Key": JUDGE0_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "Content-Type": "application/json"
            }
        }
    );

    return {
        stdout: res.data.stdout,
        stderr: res.data.stderr,
        time_ms: res.data.time
    };
}

