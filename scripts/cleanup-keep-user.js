#!/usr/bin/env node
/*
  Cleanup users script: keeps a single email, deletes all other users and their data.
  Safe by default (dry‑run). Use --email and --yes to execute.

  Usage:
    node scripts/cleanup-keep-user.js --email="n.a.hasnaoui19@gmail.com" --dry-run
    node scripts/cleanup-keep-user.js --email="n.a.hasnaoui19@gmail.com" --yes
*/

const { PrismaClient } = require('@prisma/client')

function getArg(name, fallback) {
  const m = process.argv.find(a => a.startsWith(`--${name}=`))
  if (m) return m.split('=').slice(1).join('=')
  return fallback
}

async function main() {
  const keepEmail = getArg('email', process.env.KEEP_EMAIL)
  const yes = process.argv.includes('--yes') || process.argv.includes('--force')
  const dry = process.argv.includes('--dry-run') || !yes

  if (!keepEmail) {
    console.error('Missing --email=... (email to keep)')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  console.log(`[cleanup] Keeping user with email: ${keepEmail}`)

  const keep = await prisma.user.findUnique({ where: { email: keepEmail }, select: { id: true, email: true } })
  if (!keep) {
    console.error(`[cleanup] User not found: ${keepEmail}`)
    process.exit(2)
  }

  const removeUsers = await prisma.user.findMany({
    where: { email: { not: keepEmail } },
    select: { id: true, email: true }
  })
  const ids = removeUsers.map(u => u.id)
  console.log(`[cleanup] Users to delete: ${removeUsers.length}`)
  if (removeUsers.length) {
    console.log(removeUsers.slice(0, 10).map(u => ` - ${u.email}`).join('\n') + (removeUsers.length > 10 ? `\n ... (+${removeUsers.length - 10})` : ''))
  }

  if (dry) {
    console.log('[cleanup] Dry‑run only. Pass --yes to execute.')
    await prisma.$disconnect()
    return
  }

  // Deletion order: child tables that do not cascade on user → then users
  await prisma.$transaction(async (tx) => {
    const orIds = (field) => ({ [field]: { in: ids } })

    // 1) Messages & Conversations
    try { await tx.message.deleteMany({ where: { OR: [orIds('senderId'), orIds('receiverId')] } }) } catch {}
    try { await tx.conversation.deleteMany({ where: { OR: [orIds('escortId'), orIds('clientId')] } }) } catch {}

    // 2) KYC submissions
    try { await tx.kycSubmission.deleteMany({ where: { userId: { in: ids } } }) } catch {}

    // 3) Auth artifacts (sessions/accounts/password tokens)
    try { await tx.session.deleteMany({ where: { userId: { in: ids } } }) } catch {}
    try { await tx.account.deleteMany({ where: { userId: { in: ids } } }) } catch {}
    try { await tx.passwordResetToken.deleteMany({ where: { userId: { in: ids } } }) } catch {}

    // 4) Subscriptions
    try { await tx.escortSubscription.deleteMany({ where: { userId: { in: ids } } }) } catch {}

    // 5) Finally users (cascade should clean remaining dependents)
    await tx.user.deleteMany({ where: { id: { in: ids } } })
  })

  console.log('[cleanup] Completed.')
  await prisma.$disconnect()
}

main().catch(async (e) => { console.error(e); process.exit(1) })

