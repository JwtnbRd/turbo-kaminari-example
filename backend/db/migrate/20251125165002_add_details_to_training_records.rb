class AddDetailsToTrainingRecords < ActiveRecord::Migration[8.0]
  def change
    add_column :training_records, :reps, :integer
    add_column :training_records, :duration, :integer
    add_column :training_records, :weight, :decimal
    add_column :training_records, :notes, :text
  end
end
