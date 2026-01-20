# Training モデル動作確認スクリプト

puts "=== Training モデル動作確認開始 ==="

# 1. 基本的な作成テスト
puts "\n1. テストデータ作成"
training = Training.create!(
  name: "テスト腕立て伏せ",
  description: "テスト用の腕立て伏せです",
  duration: 60,
  base_points: 10,
  difficulty: "beginner",
  published: true
)
puts "作成されたTraining: #{training.name} (ID: #{training.id})"

# 2. バリデーション確認
puts "\n2. バリデーション確認"
invalid_training = Training.new(name: "", duration: -1)
puts "バリデーションエラー: #{invalid_training.valid? ? 'なし' : invalid_training.errors.full_messages.join(', ')}"

# 3. 新しいscopeテスト
puts "\n3. Scopeテスト"
puts "Published trainings: #{Training.published.count}件"
puts "Beginner difficulty: #{Training.by_difficulty('beginner').count}件"
puts "For user level beginner: #{Training.for_user_level('beginner').count}件"

# 4. カスタムメソッドテスト
puts "\n4. カスタムメソッド確認"
puts "Calculate points: #{training.calculate_points}"
puts "Difficulty multiplier: #{training.difficulty_multiplier}"
puts "Available for beginner: #{training.available_for_user?('beginner')}"
puts "Duration category: #{training.duration_category}"
puts "Formatted duration: #{training.formatted_duration}"

puts "\n=== 動作確認完了 ==="