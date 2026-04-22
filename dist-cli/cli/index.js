// src/cli.ts
import { Command } from 'commander';
import axios, { AxiosHeaders } from 'axios';
import readline from 'node:readline';
import chalk from 'chalk';
// =============================================================================
// Config
// =============================================================================
const program = new Command();
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';
// Compte de service demandé
const SERVICE_EMAIL = 'service@ticketing.com';
const SERVICE_PASSWORD = 'CompteDeService2025!';
// =============================================================================
// Pretty output helpers
// =============================================================================
function ok(msg) {
    console.log(chalk.green(`✔ ${msg}`));
}
function info(msg) {
    console.log(chalk.cyan(`ℹ ${msg}`));
}
function warn(msg) {
    console.log(chalk.yellow(`⚠ ${msg}`));
}
function fail(msg) {
    console.error(chalk.red(`✖ ${msg}`));
}
function printJson(data) {
    console.log(chalk.gray('—'.repeat(60)));
    console.log(JSON.stringify(data, null, 2));
    console.log(chalk.gray('—'.repeat(60)));
}
// =============================================================================
// API client with runtime token (service account)
// =============================================================================
let runtimeToken = process.env.API_TOKEN ?? null;
function client() {
    const c = axios.create({
        baseURL: API_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
    });
    // Inject token at request time
    c.interceptors.request.use((config) => {
        if (runtimeToken) {
            // Axios v1: headers = AxiosHeaders (pas un simple {})
            const headers = AxiosHeaders.from(config.headers ?? {});
            headers.set('Authorization', `Bearer ${runtimeToken}`);
            config.headers = headers;
        }
        return config;
    });
    return c;
}
// Small helper to extract readable message
function errMsg(e) {
    const data = e?.response?.data;
    // Common NestJS shapes: { message: string } or { message: string[] }
    const m = data?.message;
    if (Array.isArray(m))
        return m.join(', ');
    return m ?? e?.message ?? 'Unknown error';
}
// =============================================================================
// Auth: ensure service account exists & token is available
// =============================================================================
async function loginService() {
    const c = client();
    const res = await c.post('/auth/login', {
        email: SERVICE_EMAIL,
        password: SERVICE_PASSWORD,
    });
    // Accept several common token shapes
    const token = res.data?.access_token ??
        res.data?.accessToken ??
        res.data?.token ??
        res.data?.jwt ??
        res.data?.data?.access_token ??
        res.data?.data?.accessToken ??
        res.data?.data?.token;
    if (!token || typeof token !== 'string') {
        throw new Error(`Login OK mais token introuvable dans la réponse (clés testées: accessToken/token/jwt). Réponse: ${JSON.stringify(res.data)}`);
    }
    return token;
}
async function registerServiceIfNeeded() {
    const c = client();
    try {
        await c.post('/auth/register', {
            email: SERVICE_EMAIL,
            password: SERVICE_PASSWORD,
            // si le back attend d'autres champs, il ignorera ceux-ci ou renverra une erreur
            // -> dans ce cas, on remontera le message serveur en clair
            name: 'Service Account',
        });
        ok(`Compte de service créé: ${SERVICE_EMAIL}`);
    }
    catch (e) {
        // Si déjà existant, beaucoup de back renvoient 409 ou 400 "already exists"
        const status = e?.response?.status;
        const message = errMsg(e).toLowerCase();
        const looksLikeAlreadyExists = status === 409 ||
            message.includes('already') ||
            message.includes('exists') ||
            message.includes('existe') ||
            message.includes('déjà');
        if (looksLikeAlreadyExists) {
            info(`Compte de service déjà existant: ${SERVICE_EMAIL}`);
            return;
        }
        throw new Error(errMsg(e));
    }
}
async function ensureServiceToken() {
    // If user provided API_TOKEN, keep it. Otherwise generate with service account.
    if (runtimeToken) {
        info('API_TOKEN détecté (env). Utilisation du token fourni.');
        return;
    }
    info(`Auth via compte de service: ${SERVICE_EMAIL}`);
    try {
        runtimeToken = await loginService();
        ok('Token service obtenu (login).');
        return;
    }
    catch (e) {
        warn(`Login service KO: ${errMsg(e)} — tentative de création du compte…`);
    }
    await registerServiceIfNeeded();
    runtimeToken = await loginService();
    ok('Token service obtenu (après register+login).');
}
// =============================================================================
// Commands (commander)
// =============================================================================
program
    .name('ticketing-cli')
    .description('CLI pour interagir avec l’API du système de ticketing')
    .version('0.2.0');
program
    .command('health')
    .description('Vérifie la disponibilité de l’API')
    .action(async () => {
    await ensureServiceToken();
    const c = client();
    const res = await c.get('/').catch((e) => {
        throw new Error(errMsg(e));
    });
    ok('API OK');
    printJson(res.data);
});
const tickets = program.command('tickets').description('Commandes tickets');
tickets
    .command('list')
    .description('Liste les tickets')
    .action(async () => {
    await ensureServiceToken();
    const c = client();
    const res = await c.get('/tickets').catch((e) => {
        throw new Error(errMsg(e));
    });
    ok('Tickets récupérés');
    printJson(res.data);
});
tickets
    .command('create')
    .description('Crée un ticket')
    .requiredOption('--title <title>', 'Titre')
    .requiredOption('--priority <priority>', 'Priorité: LOW|MEDIUM|HIGH|CRITICAL')
    .requiredOption('--workflowId <workflowId>', 'Workflow ID (UUID)')
    .option('--description <description>', 'Description', '')
    .option('--tags <tags>', 'Tags séparés par virgule', '')
    .action(async (opts) => {
    await ensureServiceToken();
    const c = client();
    const tags = String(opts.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    const payload = {
        title: String(opts.title),
        description: String(opts.description ?? ''),
        priority: String(opts.priority),
        tags,
        workflowId: String(opts.workflowId),
    };
    const res = await c.post('/tickets', payload).catch((e) => {
        throw new Error(errMsg(e));
    });
    ok('Ticket créé');
    printJson(res.data);
});
const workflows = program.command('workflows').description('Commandes workflows');
workflows
    .command('list')
    .description('Liste les workflows')
    .action(async () => {
    await ensureServiceToken();
    const c = client();
    const res = await c.get('/workflows').catch((e) => {
        throw new Error(errMsg(e));
    });
    ok('Workflows récupérés');
    printJson(res.data);
});
// =============================================================================
// Interactive shell (keeps CLI open)
// =============================================================================
async function handleLine(line) {
    const trimmed = line.trim();
    if (!trimmed)
        return;
    if (trimmed === 'exit' || trimmed === 'quit') {
        info('Bye.');
        process.exit(0);
    }
    if (trimmed === 'help') {
        console.log(chalk.whiteBright('\nCommandes disponibles:'));
        console.log(chalk.gray('  health'));
        console.log(chalk.gray('  tickets list'));
        console.log(chalk.gray('  tickets create --title "..." --priority HIGH --workflowId <uuid> [--description "..."] [--tags "a,b"]'));
        console.log(chalk.gray('  workflows list'));
        console.log(chalk.gray('  help | exit | quit\n'));
        return;
    }
    // Run commander in “one-shot” mode for this line
    const argv = splitArgs(trimmed);
    await program.parseAsync(argv, { from: 'user' });
}
function splitArgs(input) {
    // Minimal shell-like split supporting quotes
    const out = [];
    let cur = '';
    let q = null;
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (q) {
            if (ch === q) {
                q = null;
            }
            else {
                cur += ch;
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            q = ch;
            continue;
        }
        if (/\s/.test(ch)) {
            if (cur.length)
                out.push(cur), (cur = '');
            continue;
        }
        cur += ch;
    }
    if (cur.length)
        out.push(cur);
    return out;
}
async function startShell() {
    info(`API: ${API_BASE_URL}`);
    await ensureServiceToken();
    console.log(chalk.whiteBright('\nMode interactif activé. Tape: help (ou exit)\n'));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.magenta('ticketing> '),
    });
    rl.prompt();
    rl.on('line', async (line) => {
        try {
            await handleLine(line);
        }
        catch (e) {
            fail(e?.message ?? String(e));
        }
        finally {
            rl.prompt();
        }
    });
    rl.on('close', () => {
        info('CLI fermé.');
        process.exit(0);
    });
}
// =============================================================================
// Entrypoint
// =============================================================================
async function main() {
    // Si aucun argument => shell interactif (reste ouvert)
    const hasArgs = process.argv.slice(2).length > 0;
    try {
        if (!hasArgs) {
            await startShell();
            return;
        }
        await program.parseAsync(process.argv);
    }
    catch (e) {
        fail(e?.message ?? String(e));
        process.exit(1);
    }
}
void main();
