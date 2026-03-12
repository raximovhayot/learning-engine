import { db } from ".";
import { eq, and, lte, asc, sql, isNull } from "drizzle-orm";
import {
  courses,
  units,
  lessons,
  lessonSteps,
  userExerciseHistory,
  learningProgress,
  reviewQueue,
  profiles,
} from "./schema";
import type {
  NewLearningProgress,
  NewUserExerciseHistory,
  NewReviewQueueItem,
} from "./schema";

export async function getAllCourses() {
  return db
    .select()
    .from(courses)
    .orderBy(asc(courses.subject), asc(courses.title));
}

export async function getCourseBySlug(slug: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  return course ?? null;
}

export async function getCourseById(id: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  return course ?? null;
}

export async function createCourse(data: typeof courses.$inferInsert) {
  const [course] = await db.insert(courses).values(data).returning();
  return course;
}

export async function getUnitsByCourse(courseId: string) {
  return db
    .select()
    .from(units)
    .where(eq(units.courseId, courseId))
    .orderBy(asc(units.orderIndex));
}

export async function createUnit(data: typeof units.$inferInsert) {
  const [unit] = await db.insert(units).values(data).returning();
  return unit;
}

export async function getLessonsByUnit(unitId: string) {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.unitId, unitId))
    .orderBy(asc(lessons.orderIndex));
}

export async function getLessonById(id: string) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);
  return lesson ?? null;
}

export async function createLesson(data: typeof lessons.$inferInsert) {
  const [lesson] = await db.insert(lessons).values(data).returning();
  return lesson;
}

export async function getLessonSteps(lessonId: string) {
  return db
    .select()
    .from(lessonSteps)
    .where(eq(lessonSteps.lessonId, lessonId))
    .orderBy(asc(lessonSteps.orderIndex));
}

export async function createLessonStep(data: typeof lessonSteps.$inferInsert) {
  const [step] = await db.insert(lessonSteps).values(data).returning();
  return step;
}

export async function getUserProgress(userId: string, courseId?: string) {
  if (courseId) {
    return db
      .select()
      .from(learningProgress)
      .where(
        and(
          eq(learningProgress.userId, userId),
          eq(learningProgress.courseId, courseId)
        )
      );
  }
  return db
    .select()
    .from(learningProgress)
    .where(eq(learningProgress.userId, userId));
}

export async function upsertLessonProgress(data: NewLearningProgress) {
  const conditions = [
    eq(learningProgress.userId, data.userId),
    eq(learningProgress.courseId, data.courseId),
    data.lessonId
      ? eq(learningProgress.lessonId, data.lessonId)
      : isNull(learningProgress.lessonId),
  ];

  const existing = await db
    .select()
    .from(learningProgress)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(learningProgress)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningProgress.id, existing[0].id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(learningProgress)
    .values(data)
    .returning();
  return created;
}

export async function recordExerciseHistory(data: NewUserExerciseHistory) {
  const [record] = await db
    .insert(userExerciseHistory)
    .values(data)
    .returning();
  if (data.isCorrect) {
    await db
      .update(profiles)
      .set({ xp: sql`${profiles.xp} + 10` })
      .where(eq(profiles.id, data.userId));
  }
  return record;
}

export async function getDueReviews(userId: string, limit = 10) {
  const now = new Date();
  return db
    .select()
    .from(reviewQueue)
    .where(
      and(
        eq(reviewQueue.userId, userId),
        lte(reviewQueue.nextReviewAt, now)
      )
    )
    .orderBy(asc(reviewQueue.nextReviewAt))
    .limit(limit);
}

export async function addToReviewQueue(data: NewReviewQueueItem) {
  const [item] = await db.insert(reviewQueue).values(data).returning();
  return item;
}

export async function updateReviewItem(
  id: string,
  updates: Partial<typeof reviewQueue.$inferInsert>
) {
  const [item] = await db
    .update(reviewQueue)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(reviewQueue.id, id))
    .returning();
  return item;
}

export async function getReviewQueueCount(userId: string) {
  const now = new Date();
  const due = await db
    .select()
    .from(reviewQueue)
    .where(
      and(eq(reviewQueue.userId, userId), lte(reviewQueue.nextReviewAt, now))
    );
  return due.length;
}
