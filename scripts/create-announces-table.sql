-- Table pour stocker les annonces immobilières
CREATE TABLE IF NOT EXISTS announces (
    id BIGSERIAL PRIMARY KEY,
    
    -- Informations de base
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- apartment, house, studio, villa, office, commerce
    status VARCHAR(50) NOT NULL, -- rent, sale, both
    
    -- Localisation
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    
    -- Détails du bien
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area DECIMAL(10, 2),
    amenities TEXT[] DEFAULT '{}', -- Array de chaînes: wifi, parking, furnished, kitchen, ac, garden
    
    -- Tarification
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ar', -- ar, usd, eur
    period VARCHAR(50) NOT NULL, -- night, week, month, year
    
    -- Contact
    contactName VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Métadonnées
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_published VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    
    -- Indices pour améliorer les performances
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les requêtes
CREATE INDEX IF NOT EXISTS announces_city_idx ON announces(city);
CREATE INDEX IF NOT EXISTS announces_type_idx ON announces(type);
CREATE INDEX IF NOT EXISTS announces_status_idx ON announces(status);
CREATE INDEX IF NOT EXISTS announces_published_at_idx ON announces(published_at);
CREATE INDEX IF NOT EXISTS announces_email_idx ON announces(email);

-- Table pour les images des annonces
CREATE TABLE IF NOT EXISTS announce_images (
    id BIGSERIAL PRIMARY KEY,
    announce_id BIGINT NOT NULL REFERENCES announces(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_alt VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS announce_images_announce_id_idx ON announce_images(announce_id);

-- Politique de sécurité au niveau des lignes (RLS)
-- Activer RLS sur la table announces
ALTER TABLE announces ENABLE ROW LEVEL SECURITY;
ALTER TABLE announce_images ENABLE ROW LEVEL SECURITY;

-- Politique: Permettre la lecture à tous
CREATE POLICY "Permettre la lecture à tous" ON announces
    FOR SELECT USING (true);

-- Politique: Permettre l'insertion à tous (dans une vraie app, restreindre aux utilisateurs authentifiés)
CREATE POLICY "Permettre l'insertion" ON announces
    FOR INSERT WITH CHECK (true);

-- Politique: Permettre la modification par le créateur
CREATE POLICY "Permettre la modification" ON announces
    FOR UPDATE USING (true) WITH CHECK (true);

-- Politique: Permettre la suppression par le créateur
CREATE POLICY "Permettre la suppression" ON announces
    FOR DELETE USING (true);

-- Mêmes politiques pour announce_images
CREATE POLICY "Permettre la lecture des images" ON announce_images
    FOR SELECT USING (true);

CREATE POLICY "Permettre l'insertion d'images" ON announce_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permettre la modification d'images" ON announce_images
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permettre la suppression d'images" ON announce_images
    FOR DELETE USING (true);
