class CreateTrainings < ActiveRecord::Migration[8.0]
  def change
    create_table :trainings do |t|
      t.string :name, null: false
      t.text :description
      t.integer :duration, null: false
      t.integer :base_points, null: false, default: 0
      t.integer :difficulty, null: false, default: 0
      t.boolean :published, null: false, default: false

      t.timestamps
    end

    add_index :trainings, :published
  end
end
