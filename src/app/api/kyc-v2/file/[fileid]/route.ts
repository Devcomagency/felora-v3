import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileid: string }> }
) {
  try {
    // 🔒 Rate limiting pour empêcher les attaques bruteforce
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(request as any, 'kyc-file-access')
    const rl = rateLimit({ key, limit: 50, windowMs: 60_000 }) // Max 50 fichiers/min
    if (!rl.ok) {
      console.warn(`[KYC Security] Rate limit exceeded for IP`)
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }

    const { fileid: filename } = await context.params
    let decodedFilename = decodeURIComponent(filename)

    // Extraire uniquement le nom du fichier (avant les paramètres query comme ?X-Amz-...)
    if (decodedFilename.includes('?')) {
      decodedFilename = decodedFilename.split('?')[0]
    }

    // Security: prevent path traversal
    if (decodedFilename.includes('..')) {
      return NextResponse.json({ error: 'invalid_filename' }, { status: 400 })
    }

    // 🔒 SÉCURITÉ CRITIQUE : Vérifier l'authentification
    const session = await getServerSession(authOptions as any)

    if (!session?.user?.id) {
      console.warn(`[KYC Security] Unauthorized access attempt to: ${decodedFilename}`)
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    // Extraire le nom de fichier sans le préfixe kyc/
    const fileKey = decodedFilename.replace('kyc/', '')

    // 🔒 Vérifier que l'utilisateur a le droit d'accéder à ce document
    // Règle 1: Les ADMIN peuvent tout voir
    // Règle 2: Les utilisateurs peuvent voir UNIQUEMENT leurs propres documents KYC
    if (userRole !== 'ADMIN') {
      // Vérifier que ce fichier appartient bien à l'utilisateur connecté
      const submission = await prisma.kycSubmission.findFirst({
        where: {
          userId: userId,
          OR: [
            { docFrontKey: fileKey },
            { docBackKey: fileKey },
            { selfieSignKey: fileKey },
            { livenessKey: fileKey }
          ]
        },
        select: { id: true }
      })

      if (!submission) {
        console.warn(`[KYC Security] User ${userId} attempted to access unauthorized file: ${fileKey}`)
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }

      console.log(`[KYC Security] ✅ User ${userId} authorized to access their own file: ${fileKey}`)
    } else {
      console.log(`[KYC Security] ✅ Admin ${userId} accessing KYC file: ${fileKey}`)
    }

    // Configuration R2
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT
    const bucket = process.env.CLOUDFLARE_R2_BUCKET
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY

    // Récupérer le Range header pour Safari
    const range = request.headers.get('range')

    // Si pas de config R2, essayer local (dev)
    if (!endpoint || !bucket || !accessKey || !secretKey) {
      try {
        const { readFile } = await import('fs/promises')
        const { join } = await import('path')
        const { stat } = await import('fs/promises')

        const filePath = join(process.cwd(), 'uploads', 'kyc', decodedFilename)
        const stats = await stat(filePath)
        const fileSize = stats.size

        const extension = decodedFilename.split('.').pop()?.toLowerCase()
        let contentType = 'application/octet-stream'
        switch (extension) {
          case 'jpg':
          case 'jpeg': contentType = 'image/jpeg'; break
          case 'png': contentType = 'image/png'; break
          case 'webp': contentType = 'image/webp'; break
          case 'mp4': contentType = 'video/mp4'; break
          case 'webm': contentType = 'video/webm'; break
          case 'mov':
          case 'quicktime': contentType = 'video/quicktime'; break
        }

        // Si c'est une vidéo et qu'il y a un Range header
        if (range && (extension === 'mp4' || extension === 'webm' || extension === 'mov')) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
          const chunkSize = (end - start) + 1

          const { createReadStream } = await import('fs')
          const stream = createReadStream(filePath, { start, end })
          const chunks: Buffer[] = []

          for await (const chunk of stream) {
            chunks.push(chunk)
          }
          const buffer = Buffer.concat(chunks)

          return new NextResponse(buffer, {
            status: 206,
            headers: {
              'Content-Type': contentType,
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize.toString(),
              'Cache-Control': 'private, max-age=3600',
            },
          })
        }

        // Réponse complète si pas de Range
        const fileBuffer = await readFile(filePath)
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileSize.toString(),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, max-age=3600',
          },
        })
      } catch (e) {
        return NextResponse.json({ error: 'not_found_local' }, { status: 404 })
      }
    }

    // Récupérer depuis R2
    try {
      const { S3Client, GetObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3')

      const s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: true,
      })

      // Le fichier est dans le dossier kyc/ sur R2
      const key = decodedFilename.startsWith('kyc/') ? decodedFilename : `kyc/${decodedFilename}`

      // Récupérer la taille du fichier
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
      const headResponse = await s3.send(headCommand)
      const fileSize = headResponse.ContentLength || 0

      // Déterminer le content type
      const extension = decodedFilename.split('.').pop()?.toLowerCase()
      let contentType = headResponse.ContentType || 'application/octet-stream'

      if (!headResponse.ContentType) {
        switch (extension) {
          case 'jpg':
          case 'jpeg': contentType = 'image/jpeg'; break
          case 'png': contentType = 'image/png'; break
          case 'webp': contentType = 'image/webp'; break
          case 'mp4': contentType = 'video/mp4'; break
          case 'webm': contentType = 'video/webm'; break
          case 'mov':
          case 'quicktime': contentType = 'video/quicktime'; break
        }
      }

      // Si c'est une vidéo et qu'il y a un Range header
      if (range && (extension === 'mp4' || extension === 'webm' || extension === 'mov')) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end - start) + 1

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          Range: `bytes=${start}-${end}`,
        })

        const response = await s3.send(command)

        if (!response.Body) {
          return NextResponse.json({ error: 'empty_body' }, { status: 404 })
        }

        // Convertir le stream en buffer
        const chunks: Uint8Array[] = []
        for await (const chunk of response.Body as any) {
          chunks.push(chunk)
        }
        const fileBuffer = Buffer.concat(chunks)

        return new NextResponse(fileBuffer, {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Cache-Control': 'private, max-age=3600',
          },
        })
      }

      // Réponse complète si pas de Range
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const response = await s3.send(command)

      if (!response.Body) {
        return NextResponse.json({ error: 'empty_body' }, { status: 404 })
      }

      // Convertir le stream en buffer
      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as any) {
        chunks.push(chunk)
      }
      const fileBuffer = Buffer.concat(chunks)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'private, max-age=3600',
        },
      })
    } catch (e: any) {
      console.error('R2 fetch error:', e)
      console.error('Attempted key:', decodedFilename.startsWith('kyc/') ? decodedFilename : `kyc/${decodedFilename}`)
      console.error('Bucket:', bucket)
      console.error('Endpoint:', endpoint)
      return NextResponse.json({
        error: 'not_found_r2',
        details: e.message || e.code || 'UnknownError',
        key: decodedFilename.startsWith('kyc/') ? decodedFilename : `kyc/${decodedFilename}`,
        bucket,
        endpoint
      }, { status: 404 })
    }
  } catch (e: any) {
    console.error('Server error:', e)
    return NextResponse.json({
      error: 'server_error',
      details: e.message
    }, { status: 500 })
  }
}
