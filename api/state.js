const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO;
const PASSWORD     = process.env.VIAGEM_PASSWORD;
const FILE_PATH    = "data/state.json";
const BRANCH       = "main";

const BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

async function getFile() {
  const res = await fetch(`${BASE}?ref=${BRANCH}`, { headers });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET error: ${res.status}`);
  const json = await res.json();
  const content = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
  return { content, sha: json.sha };
}

async function putFile(data, sha) {
  const body = {
    message: "update state",
    content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(BASE, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT error: ${res.status} ${err}`);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-password");
  if (req.method === "OPTIONS") return res.status(200).end();

  const pwd = req.headers["x-password"];
  if (pwd !== PASSWORD) return res.status(401).json({ error: "Senha errada." });

  try {
    if (req.method === "GET") {
      const { content } = await getFile();
      const empty = { viagem: [], financeiro: [], estadia: [], "deu-merda": [] };
      return res.status(200).json(content || empty);
    }

    if (req.method === "POST") {
      const newState = req.body;
      if (!newState || typeof newState !== "object") return res.status(400).json({ error: "Payload inválido." });
      const { sha } = await getFile();
      await putFile(newState, sha);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
