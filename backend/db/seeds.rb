# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# 管理者ユーザーの作成
admin_user = User.find_or_create_by!(email: 'admin@example.com') do |user|
  user.username = 'admin'
  user.password = 'password'
  user.password_confirmation = 'password'
  user.role = :admin
end

puts "Admin user created: #{admin_user.email}"

# トレーニングマスタデータの作成
training_data = [
  {
    name: "ワイドスクワット",
    description: "太もも・おしり・体の中心をまとめて強くする基本の動き。座りっぱなし対策に最適！",
    duration: 20,
    base_points: 10,
    difficulty: :beginner,
    published: true,
    explain: [
      '足を肩幅より広めに開く。つま先は少し外向き。背すじを伸ばし、目線は前方に。', 
      'おしりを後ろに引くように、ゆっくり腰を下ろす（椅子に座るイメージ）。',
      '太ももが床と平行になるあたりで止める。無理に深く下げないこと。', 
      'かかとで床を押すように、ゆっくり立ち上がる。呼吸は止めないで。'
     ]
  },
  {
    name: "肩甲骨回し",
    description: "肩・腕の筋力維持、肩甲骨周りの柔軟性向上と姿勢改善に効果あり。",
    duration: 30,
    base_points: 5,
    difficulty: :beginner,
    published: false,
    explain: []
  },
  {
    name: "プランク",
    description: "体幹を鍛える静的トレーニング。体を一直線に保ちます。",
    duration: 30,
    base_points: 15,
    difficulty: :intermediate,
    published: false,
    explain: []
  },
  {
    name: "バーピー",
    description: "全身を使う高強度トレーニング。有酸素運動の効果も。",
    duration: 45,
    base_points: 20,
    difficulty: :advanced,
    published: false,
    explain: []
  }
]

training_data.each do |data|
  training = Training.find_or_create_by!(name: data[:name]) do |t|
    t.description = data[:description]
    t.duration = data[:duration]
    t.base_points = data[:base_points]
    t.difficulty = data[:difficulty]
    t.published = data[:published]
    t.explain = data[:explain]
  end
  puts "Training created/updated: #{training.name}"
end

# ランキング表示用ユーザーデータの作成
ranking_users_data = [
  {
    username: 'ビル・ゲイツ',
    email: 'bill.gates@example.com',
    total_points: 1500,
    current_streak: 30,
    longest_streak: 45,
    total_training_count: 120
  },
  {
    username: 'マーク・ザッカーバーグ',
    email: 'mark.zuckerberg@example.com',
    total_points: 1300,
    current_streak: 45,
    longest_streak: 50,
    total_training_count: 135
  },
  {
    username: 'ジェフ・ベゾス',
    email: 'jeff.bezos@example.com',
    total_points: 1100,
    current_streak: 25,
    longest_streak: 35,
    total_training_count: 90
  },
  {
    username: '孫正義',
    email: 'masayoshi.son@example.com',
    total_points: 900,
    current_streak: 20,
    longest_streak: 30,
    total_training_count: 75
  },
  {
    username: '大谷翔平',
    email: 'shohei.ohtani@example.com',
    total_points: 800,
    current_streak: 35,
    longest_streak: 40,
    total_training_count: 80
  }
]

ranking_users_data.each do |user_data|
  user = User.find_or_create_by!(email: user_data[:email]) do |u|
    u.username = user_data[:username]
    u.password = 'password'
    u.password_confirmation = 'password'
    u.role = :general
  end

  # UserStatの更新
  user_stat = user.user_stat
  if user_stat
    user_stat.update!(
      total_points: user_data[:total_points],
      current_streak: user_data[:current_streak],
      longest_streak: user_data[:longest_streak],
      total_training_count: user_data[:total_training_count],
      last_training_date: Date.current - rand(0..3).days
    )
  end

  puts "Ranking user created/updated: #{user.username} (#{user_data[:total_points]}pt, #{user_data[:current_streak]}days)"
end

puts "Seed data loaded successfully!"
