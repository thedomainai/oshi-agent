import admin from 'firebase-admin'

let app: admin.app.App | undefined

export function getFirebaseAdmin() {
  if (app) {
    return app
  }

  try {
    app = admin.app()
    return app
  } catch {
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : admin.credential.applicationDefault()

    app = admin.initializeApp({
      credential,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    })
    return app
  }
}

export function getFirestore() {
  const app = getFirebaseAdmin()
  return admin.firestore(app)
}
