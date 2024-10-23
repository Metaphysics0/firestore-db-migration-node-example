import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
  addDoc,
} from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

const WORKOUTS_COLLECTION_NAME = 'workouts';
const USERS_COLLECTION_NAME = 'users';

/**
 * This is an example migration.
 * It moves a workouts array field from the users collection to a
 * new "workouts" collection.
 */
export async function up({ db }: { db: Firestore }) {
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION_NAME));

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const userId = userDoc.id;

    if (userData.workouts && userData.workouts.length > 0) {
      for (const workout of userData.workouts) {
        const newWorkout = {
          user_id: userId,
          timestamp: new Date(),
          exercises: workout?.exercises ?? [],
          notes: workout?.notes ?? '',
        };

        // // Add the workout to the new workouts collection
        await addDoc(collection(db, WORKOUTS_COLLECTION_NAME), newWorkout);
      }

      // Remove the workouts field from the user document
      await updateDoc(doc(db, USERS_COLLECTION_NAME, userId), {
        workouts: deleteField(),
      });
    }
  }
}

export async function down({ db }: { db: Firestore }) {
  const workoutsRef = collection(db, WORKOUTS_COLLECTION_NAME);
  const workoutsSnapshot = await getDocs(workoutsRef);

  const userWorkouts: { [userId: string]: any[] } = {};

  for (const workoutDoc of workoutsSnapshot.docs) {
    const workoutData = workoutDoc.data();
    if (!userWorkouts[workoutData.user_id]) {
      userWorkouts[workoutData.user_id] = [];
    }
    userWorkouts[workoutData.user_id].push(workoutData);
  }

  for (const [userId, workouts] of Object.entries(userWorkouts)) {
    await updateDoc(doc(db, USERS_COLLECTION_NAME, userId), {
      workouts: workouts,
    });
  }

  // Delete all documents in the workouts collection
  for (const workoutDoc of workoutsSnapshot.docs) {
    await deleteDoc(doc(db, WORKOUTS_COLLECTION_NAME, workoutDoc.id));
  }

  console.log('Migration reverted: Workouts moved back to users table');
}
