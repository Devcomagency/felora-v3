/**
 * Script pour fixer les URLs d'images tronquées des clubs
 *
 * Problème: Les displaySrc en DB sont tronqués
 * Solution: Scanner public/uploads/clubs/ et reconstruire les URLs complètes
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function fixClubImages() {
  console.log('🔧 Démarrage du script de correction des images clubs...\n')

  try {
    // 1. Récupérer tous les clubs
    const clubs = await prisma.clubProfile.findMany({
      select: {
        id: true,
        name: true,
        galleryPhotos: true,
        videos: true
      }
    })

    console.log(`📊 ${clubs.length} clubs trouvés\n`)

    // 2. Parcourir le dossier uploads/clubs
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'clubs')

    if (!fs.existsSync(uploadsDir)) {
      console.error('❌ Dossier uploads/clubs introuvable!')
      return
    }

    const allFiles = fs.readdirSync(uploadsDir)
    console.log(`📁 ${allFiles.length} fichiers trouvés dans uploads/clubs\n`)

    let fixedCount = 0

    // 3. Pour chaque club, vérifier et fixer les URLs
    for (const club of clubs) {
      console.log(`🔍 Vérification club: ${club.name} (${club.id})`)

      const clubFiles = allFiles.filter(f => f.startsWith(club.id))
      console.log(`  └─ ${clubFiles.length} fichiers pour ce club`)

      if (clubFiles.length === 0) continue

      let needsUpdate = false
      const fixedGallery: string[] = []
      const fixedVideos: string[] = []

      // Parser les URLs actuelles
      const currentGallery = typeof club.galleryPhotos === 'string'
        ? JSON.parse(club.galleryPhotos)
        : Array.isArray(club.galleryPhotos)
        ? club.galleryPhotos
        : []

      const currentVideos = typeof club.videos === 'string'
        ? JSON.parse(club.videos)
        : Array.isArray(club.videos)
        ? club.videos
        : []

      // Fixer les images
      for (const url of currentGallery) {
        const basename = path.basename(url)

        // Chercher le fichier complet qui commence par le même préfixe
        const fullFile = clubFiles.find(f => {
          // Extraire le préfixe (avant le nom de fichier)
          const prefix = basename.split('_Capture')[0] || basename.split('.')[0]
          return f.startsWith(prefix)
        })

        if (fullFile) {
          const fullPath = `/uploads/clubs/${fullFile}`
          if (fullPath !== url) {
            console.log(`    ✏️  Fix: ${url}`)
            console.log(`       → ${fullPath}`)
            needsUpdate = true
          }
          fixedGallery.push(fullPath)
        } else {
          console.log(`    ⚠️  Pas de match pour: ${url}`)
          fixedGallery.push(url) // Garder l'ancienne URL
        }
      }

      // Fixer les vidéos
      for (const url of currentVideos) {
        const basename = path.basename(url)

        const fullFile = clubFiles.find(f => {
          const prefix = basename.split('_14251892')[0] || basename.split('.')[0]
          return f.startsWith(prefix)
        })

        if (fullFile) {
          const fullPath = `/uploads/clubs/${fullFile}`
          if (fullPath !== url) {
            console.log(`    ✏️  Fix vidéo: ${url}`)
            console.log(`       → ${fullPath}`)
            needsUpdate = true
          }
          fixedVideos.push(fullPath)
        } else {
          fixedVideos.push(url)
        }
      }

      // Mettre à jour en DB si nécessaire
      if (needsUpdate) {
        await prisma.clubProfile.update({
          where: { id: club.id },
          data: {
            galleryPhotos: fixedGallery,
            videos: fixedVideos
          }
        })
        console.log(`  ✅ Club mis à jour!\n`)
        fixedCount++
      } else {
        console.log(`  ✓ Aucune correction nécessaire\n`)
      }
    }

    console.log(`\n🎉 Terminé! ${fixedCount} clubs corrigés.`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubImages()
