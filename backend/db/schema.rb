# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_26_161418) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "training_records", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "training_id", null: false
    t.integer "points_earned", default: 0, null: false
    t.datetime "completed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "reps"
    t.integer "duration"
    t.decimal "weight"
    t.text "notes"
    t.index ["completed_at"], name: "index_training_records_on_completed_at"
    t.index ["training_id"], name: "index_training_records_on_training_id"
    t.index ["user_id", "completed_at"], name: "index_training_records_on_user_id_and_completed_at"
    t.index ["user_id"], name: "index_training_records_on_user_id"
  end

  create_table "trainings", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "duration", null: false
    t.integer "base_points", default: 0, null: false
    t.integer "difficulty", default: 0, null: false
    t.boolean "published", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "explain", default: [], array: true
    t.index ["published"], name: "index_trainings_on_published"
  end

  create_table "user_stats", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "total_points", default: 0, null: false
    t.integer "current_streak", default: 0, null: false
    t.integer "longest_streak", default: 0, null: false
    t.integer "total_training_count", default: 0, null: false
    t.date "last_training_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_stats_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "username", null: false
    t.integer "role", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "training_records", "trainings"
  add_foreign_key "training_records", "users"
  add_foreign_key "user_stats", "users"
end
