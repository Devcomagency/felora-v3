import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les détails d'une soumission KYC
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await context.params

    // Récupérer la soumission avec toutes les infos
    const submission = await prisma.kycSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            escortProfile: {
              select: {
                stageName: true,
                city: true
              }
            },
            clubProfileV2: {
              select: {
                handle: true,
                verified: true,
                details: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({
        success: false,
        error: 'Soumission KYC non trouvée'
      }, { status: 404 })
    }

    // Compter les tentatives précédentes de cet utilisateur
    const previousAttempts = await prisma.kycSubmission.count({
      where: {
        userId: submission.userId,
        createdAt: { lt: submission.createdAt }
      }
    })

    // Récupérer l'historique des soumissions
    const submissionHistory = await prisma.kycSubmission.findMany({
      where: { userId: submission.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        rejectionReason: true,
        reviewerId: true,
        reviewedAt: true
      }
    })

    // Calculer les stats utilisateur
    const userStats = {
      accountAge: Math.floor(
        (new Date().getTime() - submission.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      profileCompletion: submission.user.escortProfile || submission.user.clubProfile ? 80 : 20,
      hasProfilePhoto: !!(submission.user.escortProfile || submission.user.clubProfile),
      totalSubmissions: submissionHistory.length,
      rejectedCount: submissionHistory.filter(s => s.status === 'REJECTED').length
    }

    // Stats comparatives (moyennes globales)
    const totalSubmissions = await prisma.kycSubmission.count()
    const approvedCount = await prisma.kycSubmission.count({ where: { status: 'APPROVED' } })
    const rejectedCount = await prisma.kycSubmission.count({ where: { status: 'REJECTED' } })

    const comparativeStats = {
      approvalRate: totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0,
      rejectionRate: totalSubmissions > 0 ? Math.round((rejectedCount / totalSubmissions) * 100) : 0,
      pendingCount: await prisma.kycSubmission.count({ where: { status: 'PENDING' } })
    }

    // Helper pour construire les URLs depuis les clés
    const buildUrl = (key: string | null) => {
      if (!key) return null
      // Si c'est déjà une URL complète, la retourner
      if (key.startsWith('http')) return key
      // Sinon, construire l'URL via l'API
      return `/api/kyc-v2/file/${encodeURIComponent(key)}`
    }

    // Extraire les URLs depuis le champ notes si elles sont dans kycKeys
    let docUrls = {
      docFrontUrl: submission.docFrontUrl,
      docBackUrl: submission.docBackUrl,
      selfieSignUrl: submission.selfieSignUrl,
      livenessVideoUrl: submission.livenessVideoUrl
    }

    // Si les URLs ne sont pas directement dans les champs, chercher dans notes
    if (!submission.docFrontUrl && submission.notes) {
      try {
        const notesData = JSON.parse(submission.notes)
        if (notesData.kycKeys) {
          docUrls = {
            docFrontUrl: buildUrl(notesData.kycKeys.docFrontKey || null),
            docBackUrl: buildUrl(notesData.kycKeys.docBackKey || null),
            selfieSignUrl: buildUrl(notesData.kycKeys.selfieSignKey || null),
            livenessVideoUrl: buildUrl(notesData.kycKeys.livenessKey || null)
          }
        }
      } catch (e) {
        console.error('Error parsing notes:', e)
      }
    }

    // Calculer un risk score basique (0-100)
    let riskScore = 0

    // Augmenter le risque si plusieurs rejets
    riskScore += userStats.rejectedCount * 20

    // Augmenter si compte très récent
    if (userStats.accountAge < 1) riskScore += 30

    // Diminuer si profil bien rempli
    if (userStats.profileCompletion > 70) riskScore -= 10

    // Limiter entre 0 et 100
    riskScore = Math.max(0, Math.min(100, riskScore))

    // Flags de sécurité
    const flags = {
      multipleRejections: userStats.rejectedCount >= 2,
      newAccount: userStats.accountAge < 7,
      fastResubmission: submissionHistory.length > 1 &&
        (submission.createdAt.getTime() - submissionHistory[1].createdAt.getTime()) < (24 * 60 * 60 * 1000),
      maxAttemptsReached: previousAttempts >= 4, // 5 tentatives max (0-4)
      incompleteProfile: userStats.profileCompletion < 50
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        ...docUrls, // Écraser avec les URLs extraites si nécessaire
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        user: {
          ...submission.user,
          createdAt: submission.user.createdAt.toISOString()
        }
      },
      metadata: {
        previousAttempts,
        userStats,
        comparativeStats,
        riskScore,
        flags
      },
      history: submissionHistory.map(h => ({
        ...h,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching KYC submission details:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des détails'
    }, { status: 500 })
  }
}

// PATCH - Approuver ou rejeter une soumission
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await context.params
    const body = await request.json()
    const { action, reason, adminId = 'admin', notes } = body

    console.log('🔍 [KYC PATCH] submissionId:', submissionId)
    console.log('🔍 [KYC PATCH] action:', action)
    console.log('🔍 [KYC PATCH] reason:', reason)

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Action invalide (APPROVE ou REJECT requis)'
      }, { status: 400 })
    }

    if (action === 'REJECT' && !reason) {
      return NextResponse.json({
        success: false,
        error: 'Une raison est requise pour rejeter'
      }, { status: 400 })
    }

    // Récupérer la soumission
    const submission = await prisma.kycSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            escortProfile: { select: { id: true } },
            clubProfile: { select: { id: true } }
          }
        }
      }
    })

    console.log('🔍 [KYC PATCH] submission found:', submission ? 'YES' : 'NO')
    console.log('🔍 [KYC PATCH] submission userId:', submission?.userId)
    console.log('🔍 [KYC PATCH] submission current status:', submission?.status)

    if (!submission) {
      console.log('❌ [KYC PATCH] Soumission non trouvée avec ID:', submissionId)
      return NextResponse.json({
        success: false,
        error: 'Soumission KYC non trouvée'
      }, { status: 404 })
    }

    // Vérifier le nombre de tentatives
    const previousAttempts = await prisma.kycSubmission.count({
      where: {
        userId: submission.userId,
        status: 'REJECTED'
      }
    })

    // Si 5 rejets, bannir l'utilisateur
    const shouldBanUser = action === 'REJECT' && previousAttempts >= 4

    // Mettre à jour la soumission
    console.log('📝 [KYC PATCH] Updating submission to status:', action === 'APPROVE' ? 'APPROVED' : 'REJECTED')
    const updatedSubmission = await prisma.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        rejectionReason: action === 'REJECT' ? reason : null,
        reviewerId: adminId,
        reviewedAt: new Date(),
        notes: notes || undefined
      }
    })
    console.log('✅ [KYC PATCH] Submission updated! New status:', updatedSubmission.status)

    // Si approuvé, mettre à jour le profil utilisateur
    if (action === 'APPROVE') {
      console.log('🎖️ [KYC PATCH] Attributing badge...')
      // Marquer le profil comme vérifié
      if (submission.user.escortProfile) {
        console.log('🎖️ [KYC PATCH] Updating escortProfile badge...')
        await prisma.escortProfile.update({
          where: { id: submission.user.escortProfile.id },
          data: { isVerifiedBadge: true }
        })
        console.log('✅ [KYC PATCH] EscortProfile badge set to TRUE')
      }

      if (submission.user.clubProfile) {
        console.log('🎖️ [KYC PATCH] Updating clubProfile badge...')
        await prisma.clubProfile.update({
          where: { id: submission.user.clubProfile.id },
          data: { isVerifiedBadge: true }
        })
        console.log('✅ [KYC PATCH] ClubProfile badge set to TRUE')
      }

      // Supprimer automatiquement les documents après validation (RGPD)
      await prisma.kycSubmission.update({
        where: { id: submissionId },
        data: {
          docFrontUrl: null,
          docBackUrl: null,
          selfieSignUrl: null,
          livenessVideoUrl: null,
          notes: '[Documents supprimés après validation pour conformité RGPD]'
        }
      })
    }

    // Si rejeté et max tentatives atteint, bannir
    if (shouldBanUser) {
      await prisma.user.update({
        where: { id: submission.userId },
        data: {
          bannedAt: new Date(),
          bannedReason: 'Trop de tentatives de vérification KYC échouées (5 rejets)'
        }
      })
    }

    // Créer une notification dans la messagerie (système de notification interne)
    try {
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          type: action === 'APPROVE' ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: action === 'APPROVE'
            ? '✅ Vérification approuvée'
            : '❌ Vérification refusée',
          message: action === 'APPROVE'
            ? 'Félicitations ! Votre vérification d\'identité a été approuvée. Votre profil est maintenant vérifié.'
            : `Votre vérification d'identité a été refusée. Raison : ${reason}. ${
                shouldBanUser
                  ? 'Vous avez atteint le nombre maximum de tentatives. Votre compte a été suspendu.'
                  : `Il vous reste ${5 - previousAttempts - 1} tentative(s).`
              }`,
          read: false
        }
      })
    } catch (notifError) {
      console.error('Erreur création notification:', notifError)
      // Ne pas bloquer la validation si la notification échoue
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...updatedSubmission,
        createdAt: updatedSubmission.createdAt.toISOString(),
        updatedAt: updatedSubmission.updatedAt.toISOString()
      },
      userBanned: shouldBanUser,
      message: action === 'APPROVE'
        ? 'Soumission approuvée avec succès'
        : shouldBanUser
          ? 'Soumission rejetée. Utilisateur banni après 5 tentatives.'
          : 'Soumission rejetée'
    })

  } catch (error) {
    console.error('Error updating KYC submission:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour de la soumission'
    }, { status: 500 })
  }
}
