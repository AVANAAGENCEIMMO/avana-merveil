// Configuration depuis les variables d'environnement
// Ces variables sont injectées par le serveur/build lors du déploiement

window.SUPABASE_CONFIG = {
    url: window.__ENV_SUPABASE_URL__ || 'https://xdoqgounkfgpfjyvljxc.supabase.co',
    key: window.__ENV_SUPABASE_ANON_KEY__ || 'sb_publishable_ERhyFUNm9ijnQlnL97WFZQ_yqrZJWmU'
};

// Fonction pour initialiser les configurations
function loadConfig() {
    // Essayer de charger depuis localStorage en développement
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            window.SUPABASE_CONFIG.url = config.url;
            window.SUPABASE_CONFIG.key = config.key;
            console.log("[v0] Configuration Supabase chargée depuis localStorage");
        } catch (e) {
            console.warn("[v0] Impossible de charger la configuration depuis localStorage");
        }
    }
}

// Charger au démarrage
document.addEventListener("DOMContentLoaded", loadConfig);

// Fonction pour sauvegarder la configuration (utile pour le développement)
function saveConfig(url, key) {
    window.SUPABASE_CONFIG.url = url;
    window.SUPABASE_CONFIG.key = key;
    localStorage.setItem('supabaseConfig', JSON.stringify({
        url: url,
        key: key
    }));
    console.log("[v0] Configuration Supabase sauvegardée");
}
