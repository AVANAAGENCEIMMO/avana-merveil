// Configuration Supabase
let supabase = null;
let allAnnounces = [];

// Initialiser Supabase
function initSupabase() {
    try {
        if (!window.SUPABASE_CONFIG) {
            console.error("[v0] Configuration Supabase non trouvée");
            showNoResults();
            return;
        }

        const { url, key } = window.SUPABASE_CONFIG;

        if (!url || !key || url.includes('https://xdoqgounkfgpfjyvljxc.supabase.co')) {
            console.error("[v0] Clés Supabase non configurées");
            showNoResults();
            return;
        }

        supabase = window.supabase.createClient(url, key);
        console.log("[v0] Supabase initialisé avec succès");
        loadAnnounces();
    } catch (error) {
        console.error("[v0] Erreur lors de l'initialisation de Supabase:", error);
        showNoResults();
    }
}

// Initialiser au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    initSupabase();
    setupFilterListeners();
});

// Charger les annonces depuis Supabase
async function loadAnnounces() {
    if (!supabase) {
        console.error("[v0] Supabase n'est pas initialisé");
        return;
    }

    try {
        console.log("[v0] Chargement des annonces...");

        const { data, error } = await supabase
            .from("announces")
            .select("*")
            .order("published_at", { ascending: false });

        if (error) {
            console.error("[v0] Erreur lors du chargement:", error);
            showNoResults();
            return;
        }

        console.log("[v0] Annonces chargées:", data);

        if (!data || data.length === 0) {
            showNoResults();
            return;
        }

        allAnnounces = data;
        displayAnnounces(allAnnounces);

    } catch (error) {
        console.error("[v0] Erreur lors du chargement des annonces:", error);
        showNoResults();
    }
}

// Afficher les annonces
function displayAnnounces(announces) {
    const container = document.getElementById("announcesContainer");
    const noResults = document.getElementById("noResults");

    if (announces.length === 0) {
        container.innerHTML = "";
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";
    container.innerHTML = "";

    announces.forEach(announce => {
        const card = createAnnounceCard(announce);
        container.appendChild(card);
    });
}

// Créer une carte d'annonce
function createAnnounceCard(announce) {
    const card = document.createElement("div");
    card.className = "announce-card";

    const typeLabels = {
        apartment: "Appartement",
        house: "Maison",
        studio: "Studio",
        villa: "Villa",
        office: "Bureau",
        commerce: "Commerce"
    };

    const statusLabels = {
        rent: "Location",
        sale: "Vente",
        both: "Location & Vente"
    };

    const typeLabel = typeLabels[announce.type] || announce.type;
    const statusLabel = statusLabels[announce.status] || announce.status;

    const bedroomsText = announce.bedrooms ? `${announce.bedrooms}🛏` : "";
    const bathroomsText = announce.bathrooms ? `${announce.bathrooms}🚿` : "";
    const areaText = announce.area ? `${announce.area}m²` : "";

    const features = [bedroomsText, bathroomsText, areaText].filter(f => f).join(" • ");

    card.innerHTML = `
        <div class="announce-image">
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0a2a43, #144b73); display: flex; align-items: center; justify-content: center; color: white;">
                📷 Pas d'image
            </div>
            <span class="announce-badge ${announce.status}">${statusLabel}</span>
        </div>
        <div class="announce-info">
            <span class="announce-type">${typeLabel}</span>
            <h3 class="announce-title">${announce.title}</h3>
            <p class="announce-location">📍 ${announce.address}</p>
            ${features ? `<div class="announce-features">${features}</div>` : ""}
            <div class="announce-price">${announce.price.toLocaleString()} ${announce.currency.toUpperCase()}/${announce.period}</div>
            <div class="announce-actions">
                <button class="view-btn" onclick="viewDetails(${announce.id})">Voir détails</button>
                <button class="edit-btn" onclick="editAnnounce(${announce.id})">Éditer</button>
                <button class="delete-btn" onclick="deleteAnnounce(${announce.id})">Supprimer</button>
            </div>
        </div>
    `;

    return card;
}

// Voir les détails d'une annonce
function viewDetails(announceId) {
    const announce = allAnnounces.find(a => a.id === announceId);
    if (!announce) return;

    const modal = document.getElementById("detailsModal");
    const modalBody = document.getElementById("modalBody");

    const typeLabels = {
        apartment: "Appartement",
        house: "Maison",
        studio: "Studio",
        villa: "Villa",
        office: "Bureau",
        commerce: "Commerce"
    };

    const statusLabels = {
        rent: "Location",
        sale: "Vente",
        both: "Location & Vente"
    };

    const amenitiesLabels = {
        wifi: "WiFi",
        parking: "Parking",
        furnished: "Meublé",
        kitchen: "Cuisine équipée",
        ac: "Climatisation",
        garden: "Jardin"
    };

    const amenitiesHTML = announce.amenities && announce.amenities.length > 0
        ? `<div class="modal-amenities">
            <h4>Équipements</h4>
            <div class="amenities-list">
                ${announce.amenities.map(a => `<span class="amenity-tag">${amenitiesLabels[a] || a}</span>`).join("")}
            </div>
        </div>`
        : "";

    modalBody.innerHTML = `
        <div class="modal-gallery">
            <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #0a2a43, #144b73); display: flex; align-items: center; justify-content: center; color: white; border-radius: 6px; grid-column: 1 / -1;">
                📷 Pas d'images disponibles
            </div>
        </div>

        <div class="modal-details">
            <div class="detail-item">
                <strong>Type</strong>
                ${typeLabels[announce.type] || announce.type}
            </div>
            <div class="detail-item">
                <strong>Statut</strong>
                ${statusLabels[announce.status] || announce.status}
            </div>
            <div class="detail-item">
                <strong>Localisation</strong>
                ${announce.address}<br>
                ${announce.city}${announce.district ? ", " + announce.district : ""}
            </div>
            <div class="detail-item">
                <strong>Prix</strong>
                ${announce.price.toLocaleString()} ${announce.currency.toUpperCase()}/${announce.period}
            </div>
            ${announce.bedrooms !== null && announce.bedrooms > 0 ? `
            <div class="detail-item">
                <strong>Chambres</strong>
                ${announce.bedrooms}
            </div>
            ` : ""}
            ${announce.bathrooms !== null && announce.bathrooms > 0 ? `
            <div class="detail-item">
                <strong>Salles de bain</strong>
                ${announce.bathrooms}
            </div>
            ` : ""}
            ${announce.area ? `
            <div class="detail-item">
                <strong>Superficie</strong>
                ${announce.area} m²
            </div>
            ` : ""}
        </div>

        ${amenitiesHTML}

        <div style="margin-bottom: 20px;">
            <strong style="color: #0a2a43; display: block; margin-bottom: 10px;">Description</strong>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${announce.description}</p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px;">
            <strong style="color: #0a2a43; display: block; margin-bottom: 10px;">Contact</strong>
            <p style="color: #666; margin: 5px 0;">
                <strong>Nom:</strong> ${announce.contactName}
            </p>
            <p style="color: #666; margin: 5px 0;">
                <strong>Téléphone:</strong> <a href="tel:${announce.phone}" style="color: #0a2a43; text-decoration: none;">${announce.phone}</a>
            </p>
            <p style="color: #666; margin: 5px 0;">
                <strong>Email:</strong> <a href="mailto:${announce.email}" style="color: #0a2a43; text-decoration: none;">${announce.email}</a>
            </p>
        </div>

        <div style="margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">
                Publiée le ${new Date(announce.published_at).toLocaleDateString("fr-FR")}
            </p>
        </div>
    `;

    modal.style.display = "flex";
}

// Éditer une annonce
function editAnnounce(announceId) {
    console.log("[v0] Édition de l'annonce:", announceId);
    // À implémenter: rediriger vers un formulaire d'édition
    alert("Fonctionnalité d'édition à venir");
}

// Supprimer une annonce
async function deleteAnnounce(announceId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce?")) {
        return;
    }

    if (!supabase) {
        console.error("[v0] Supabase n'est pas initialisé");
        return;
    }

    try {
        console.log("[v0] Suppression de l'annonce:", announceId);

        const { error } = await supabase
            .from("announces")
            .delete()
            .eq("id", announceId);

        if (error) {
            console.error("[v0] Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression");
            return;
        }

        console.log("[v0] Annonce supprimée avec succès");
        alert("Annonce supprimée avec succès");
        
        // Recharger les annonces
        loadAnnounces();

    } catch (error) {
        console.error("[v0] Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
    }
}

// Afficher "Pas de résultats"
function showNoResults() {
    const container = document.getElementById("announcesContainer");
    const noResults = document.getElementById("noResults");

    container.innerHTML = "";
    noResults.style.display = "block";
}

// Configuration des écouteurs de filtrage
function setupFilterListeners() {
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (typeFilter) typeFilter.addEventListener("change", applyFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);

    // Fermer le modal
    const modal = document.getElementById("detailsModal");
    const closeBtn = document.querySelector(".close-modal");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
}

// Appliquer les filtres
function applyFilters() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    const filtered = allAnnounces.filter(announce => {
        const matchesSearch = announce.title.toLowerCase().includes(searchInput) ||
                            announce.description.toLowerCase().includes(searchInput) ||
                            announce.address.toLowerCase().includes(searchInput);
        const matchesType = !typeFilter || announce.type === typeFilter;
        const matchesStatus = !statusFilter || announce.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    displayAnnounces(filtered);
}
