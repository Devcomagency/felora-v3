#!/bin/bash

# Créer des images de test simples
echo "Création d'images de test..."

# Vérifier si ImageMagick est disponible
if command -v convert >/dev/null 2>&1; then
    echo "Utilisation d'ImageMagick pour créer les images..."

    convert -size 800x600 xc:lightblue -pointsize 48 -fill black -gravity center -annotate +0+0 "Club Test Image 1" public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_0_1727615846_20250520_191846.jpg

    convert -size 800x600 xc:lightgreen -pointsize 48 -fill black -gravity center -annotate +0+0 "Club Test Image 2" public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_video_1_1727615846_14272195_2160_3840_50fps.jpg

    convert -size 800x600 xc:lightpink -pointsize 48 -fill black -gravity center -annotate +0+0 "Club Test Image 3" public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_2_1727615846_20250520_191846_2.jpg

    convert -size 800x600 xc:lightyellow -pointsize 48 -fill black -gravity center -annotate +0+0 "Club Test Image 4" public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_3_1727615846_emploi_suisse.jpg

    echo "✅ Images créées avec ImageMagick"
else
    echo "ImageMagick non disponible, création de fichiers temporaires..."

    # Créer des fichiers JPG très basiques avec un contenu
    echo -e "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xfe\x00\x13Created with bash" > public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_0_1727615846_20250520_191846.jpg
    echo -e "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xfe\x00\x13Created with bash" > public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_video_1_1727615846_14272195_2160_3840_50fps.jpg
    echo -e "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xfe\x00\x13Created with bash" > public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_2_1727615846_20250520_191846_2.jpg
    echo -e "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xfe\x00\x13Created with bash" > public/uploads/clubs/cmg4ww1aa00051xfgo7ilxnod_image_3_1727615846_emploi_suisse.jpg

    echo "✅ Fichiers de test créés"
fi

echo "Images créées avec succès!"
ls -la public/uploads/clubs/