// Configuration Supabase
const SUPABASE_URL = 'https://xdoqgounkfgpfjyvljxc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ERhyFUNm9ijnQlnL97WFZQ_yqrZJWmU';

// Initialiser Supabase
function initSupabase() {
    try {
        if (!window.SUPABASE_CONFIG) {
            showMessage("Erreur: Configuration Supabase non trouvée. Veuillez d'abord <a href='setup-supabase.html'>configurer Supabase</a>.", "error");
            return;
        }

        const { url, key } = window.SUPABASE_CONFIG;

        if (!url || !key || url.includes('YOUR_SUPABASE_URL')) {
            showMessage("Erreur: Configurez vos clés Supabase dans le <a href='setup-supabase.html'>formulaire de configuration</a>.", "error");
            return;
        }

        supabase = window.supabase.createClient(url, key);
        console.log("[v0] Supabase initialisé avec succès");
    } catch (error) {
        console.error("[v0] Erreur lors de l'initialisation de Supabase:", error);
        showMessage("Erreur de connexion à la base de données", "error");
    }
}

// Initialiser au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    initSupabase();
    setupFormListeners();
});

// Configuration des écouteurs du formulaire
function setupFormListeners() {
    const form = document.getElementById("announceForm");
    const imagesInput = document.getElementById("images");

    // Gestion de l'upload d'images
    if (imagesInput) {
        imagesInput.addEventListener("change", handleImageSelection);
    }

    // Soumission du formulaire
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
}

// Gestion de la sélection des images
function handleImageSelection(event) {
    const files = Array.from(event.target.files);
    
    // Limiter à 5 images
    if (files.length > 5) {
        showMessage("Vous pouvez ajouter un maximum de 5 images", "error");
        event.target.value = "";
        return;
    }

    selectedImages = [];
    const previewDiv = document.getElementById("imagePreview");
    previewDiv.innerHTML = "";

    files.forEach((file, index) => {
        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
            showMessage("Seules les images sont acceptées", "error");
            return;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage(`L'image ${file.name} est trop volumineuse (max 5MB)`, "error");
            return;
        }

        selectedImages.push(file);

        // Créer un aperçu
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewItem = document.createElement("div");
            previewItem.className = "preview-item";
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Aperçu ${index + 1}">
                <button type="button" class="remove-btn" onclick="removeImage(${index})">×</button>
            `;
            previewDiv.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

// Supprimer une image
function removeImage(index) {
    selectedImages.splice(index, 1);
    document.getElementById("images").value = "";
    
    // Redessiner les aperçus
    const previewDiv = document.getElementById("imagePreview");
    previewDiv.innerHTML = "";
    
    selectedImages.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewItem = document.createElement("div");
            previewItem.className = "preview-item";
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Aperçu ${idx + 1}">
                <button type="button" class="remove-btn" onclick="removeImage(${idx})">×</button>
            `;
            previewDiv.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

// Traiter la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!supabase) {
        showMessage("Erreur: Supabase n'est pas initialisé", "error");
        return;
    }

    showMessage("Publication de votre annonce en cours...", "loading");

    try {
        // Récupérer les données du formulaire
        const formData = {
            title: document.getElementById("title").value.trim(),
            description: document.getElementById("description").value.trim(),
            type: document.getElementById("type").value,
            status: document.getElementById("status").value,
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            district: document.getElementById("district").value.trim() || null,
            bedrooms: parseInt(document.getElementById("bedrooms").value) || 0,
            bathrooms: parseInt(document.getElementById("bathrooms").value) || 0,
            area: parseFloat(document.getElementById("area").value) || null,
            amenities: getSelectedAmenities(),
            price: parseFloat(document.getElementById("price").value),
            currency: document.getElementById("currency").value,
            period: document.getElementById("period").value,
            contactName: document.getElementById("contactName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            published_at: new Date().toISOString(),
            status_published: "active"
        };

        // Validation basique
        if (!formData.title || !formData.description || !formData.address) {
            showMessage("Veuillez remplir tous les champs obligatoires", "error");
            return;
        }

        console.log("[v0] Données du formulaire à insérer:", formData);

        // Insérer dans la base de données
        const { data, error } = await supabase
            .from("announces")
            .insert([formData])
            .select();

        if (error) {
            console.error("[v0] Erreur Supabase:", error);
            showMessage(`Erreur: ${error.message}`, "error");
            return;
        }

        console.log("[v0] Annonce créée avec succès:", data);

        // Upload des images si présentes
        if (selectedImages.length > 0 && data && data[0]) {
            await uploadImages(data[0].id);
        }

        // Succès
        showMessage("✅ Votre annonce a été publiée avec succès!", "success");
        
        // Réinitialiser le formulaire
        setTimeout(() => {
            document.getElementById("announceForm").reset();
            document.getElementById("imagePreview").innerHTML = "";
            selectedImages = [];
            
            // Rediriger vers la page des annonces après 2 secondes
            setTimeout(() => {
                window.location.href = "list-announces.html";
            }, 2000);
        }, 1000);

    } catch (error) {
        console.error("[v0] Erreur lors de la soumission:", error);
        showMessage(`Erreur: ${error.message}`, "error");
    }
}

// Upload des images vers Supabase Storage
async function uploadImages(announceId) {
    try {
        console.log(`[v0] Début du upload des ${selectedImages.length} images pour l'annonce ${announceId}`);

        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const fileName = `${announceId}_${i}_${Date.now()}_${file.name}`;
            const filePath = `announces/${announceId}/${fileName}`;

            console.log(`[v0] Upload de l'image ${i + 1}/${selectedImages.length}: ${filePath}`);

            // Upload le fichier
            const { data, error } = await supabase.storage
                .from("announces-images")
                .upload(filePath, file);

            if (error) {
                console.error(`[v0] Erreur lors du upload de l'image ${i + 1}:`, error);
                continue;
            }

            console.log(`[v0] Image ${i + 1} uploadée avec succès`);

            // Optionnel: Ajouter l'URL de l'image à la table announce_images
            // Vous devriez créer une table announce_images pour stocker les URLs
        }

        console.log("[v0] Tous les uploads sont terminés");

    } catch (error) {
        console.error("[v0] Erreur lors du upload des images:", error);
    }
}

// Récupérer les équipements sélectionnés
function getSelectedAmenities() {
    const checkboxes = document.querySelectorAll('input[name="amenities"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Afficher les messages
function showMessage(message, type = "info") {
    const messageDiv = document.getElementById("submitMessage");
    
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Auto-masquer après 5 secondes (sauf pour le loading)
    if (type !== "loading") {
        setTimeout(() => {
            messageDiv.className = "message";
        }, 5000);
    }
}

// Ajouter les clés Supabase depuis les variables d'environnement
// IMPORTANT: À ajouter dans les variables d'environnement du projet
window.addEventListener("load", () => {
    // Si les clés ne sont pas configurées, afficher un message
    if (SUPABASE_URL.includes("YOUR_SUPABASE_URL")) {
        console.error("[v0] Les clés Supabase ne sont pas configurées!");
        showMessage("⚠️ Les paramètres Supabase ne sont pas configurés. Veuillez les ajouter dans les variables d'environnement.", "error");
    }
});
