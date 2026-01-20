class CreateTrainingRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :training_records do |t|
      t.references :user, null: false, foreign_key: true
      t.references :training, null: false, foreign_key: true
      t.integer :points_earned, null: false, default: 0
      t.datetime :completed_at, null: false

      t.timestamps
    end

    add_index :training_records, [:user_id, :completed_at]
    add_index :training_records, :completed_at
  end
end
