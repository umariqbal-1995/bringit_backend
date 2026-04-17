import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

let initialized = false;

export function initFirebase(): void {
  if (initialized || admin.apps.length) {
    initialized = true;
    return;
  }

  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id ?? 'bringit-5fc69',
      });
      initialized = true;
      logger.info('Firebase Admin SDK initialized with service account');
    } catch (err) {
      logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON', err);
    }
  } else if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'bringit-5fc69',
    });
    initialized = true;
    logger.info('Firebase Admin SDK initialized with application default credentials');
  } else {
    logger.warn(
      'Firebase Admin SDK: no credentials provided. ' +
        'Set FIREBASE_SERVICE_ACCOUNT env var with service account JSON. ' +
        'Push notifications are disabled.',
    );
  }
}

export function isFirebaseReady(): boolean {
  return initialized && admin.apps.length > 0;
}

export { admin };
