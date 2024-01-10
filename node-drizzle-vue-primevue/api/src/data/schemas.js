const { pgTable, serial, varchar, boolean, integer, timestamp, jsonb } = require("drizzle-orm/pg-core");
const { relations, sql } = require("drizzle-orm");

//#region User
const UserSchema = pgTable("user", {
  id: serial("user_id").primaryKey(),
  name: varchar("name", { length: 32 }).notNull(),
  username: varchar("username", { length: 32 }).notNull(),
  email: varchar("email", { length: 128 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  passwordRecoveryToken: varchar("password_recovery_token", { length: 256 }),
  avatar: varchar("avatar", { length: 512 }),
  cover: varchar("cover", { length: 512 }),
  otpSecret: varchar("otp_secret", { length: 32 }),
  otpUri: varchar("otp_uri", { length: 256 }),
  otpEnabled: boolean("otp_enabled").default(false).notNull(),
  otpVerified: boolean("otp_verified").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
})

const UserHistorySchema = pgTable("user_history", {
  id: serial("user_history_id").primaryKey(),
  userId: integer("user_id").references(() => UserSchema.id).notNull(),
  operatorId: integer("operator_id").references(() => UserSchema.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  event: varchar("event", { length: 64 }).notNull(),
  data: jsonb("data")
})

const UserRelations = relations(UserSchema, ({ one, many }) => ({
  histories: many(UserHistorySchema, { relationName: "user" })
}))

const UserHistoryRelations = relations(UserHistorySchema, ({ one, many }) => ({
  user: one(UserSchema, {
    fields: [UserHistorySchema.userId],
    references: [UserSchema.id],
    relationName: "user"
  })
}))
//#endregion User

module.exports = {
  // User
  UserSchema,
  UserHistorySchema,
  UserRelations,
  UserHistoryRelations,
};