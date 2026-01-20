# 管理者用Training API動作確認スクリプト

puts "=== 管理者用Training API動作確認開始 ==="

# 1. 管理者ユーザー作成
puts "\n1. 管理者ユーザー作成"
admin_user = User.find_or_create_by(email: 'admin@example.com') do |user|
  user.username = 'admin'
  user.password = 'password123'
  user.role = :admin
end
puts "管理者ユーザー: #{admin_user.username} (role: #{admin_user.role})"

# 2. 一般ユーザー作成
puts "\n2. 一般ユーザー作成"
general_user = User.find_or_create_by(email: 'user@example.com') do |user|
  user.username = 'user'
  user.password = 'password123'
  user.role = :general
end
puts "一般ユーザー: #{general_user.username} (role: #{general_user.role})"

# 3. テスト用トレーニング作成
puts "\n3. テスト用トレーニング作成"
training = Training.create!(
  name: "管理者テスト腕立て伏せ",
  description: "管理者API用のテストトレーニングです",
  duration: 30,
  base_points: 5,
  difficulty: "beginner",
  published: false
)
puts "作成されたTraining: #{training.name} (ID: #{training.id})"

# 4. ルーティング確認
puts "\n4. ルーティング確認"
Rails.application.routes.routes.each do |route|
  if route.path.spec.to_s.include?('admin/trainings')
    puts "#{route.verb.ljust(10)} #{route.path.spec} -> #{route.defaults[:controller]}##{route.defaults[:action]}"
  end
end

# 5. Admin::TrainingSerializer確認
puts "\n5. シリアライザー確認"
serialized = Admin::TrainingSerializer.new(training).as_json
puts "シリアライズ結果: #{serialized.keys.join(', ')}"

puts "\n=== 動作確認完了 ==="
puts "\n次のステップ:"
puts "1. Rails サーバーを起動"
puts "2. 管理者でログインしてJWTトークン取得"
puts "3. curl でAPI動作確認"