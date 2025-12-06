-- 🧹 SCRIPT DE NETTOYAGE MANUEL
-- À exécuter dans le SQL Editor de Supabase
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- 1. Supprimer les réactions
DELETE FROM "Reaction";

-- 2. Supprimer les médias
DELETE FROM "Media";

-- 3. Supprimer les messages
DELETE FROM "Message";

-- 4. Supprimer les conversations
DELETE FROM "Conversation";

-- 5. Supprimer les profils clubs
DELETE FROM "ClubProfileV2";

-- 6. Supprimer les profils escorts
DELETE FROM "EscortProfile";

-- 7. Supprimer les utilisateurs non-admin
DELETE FROM "User" WHERE role != 'ADMIN';

-- 8. Vérifier ce qui reste (doit montrer uniquement les admins)
SELECT email, role FROM "User";
