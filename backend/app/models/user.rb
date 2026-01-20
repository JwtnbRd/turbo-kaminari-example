class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Enum
  enum :role, { general: 0, admin: 1 }, default: :general

  # Associations
  has_many :training_records, dependent: :destroy
  has_one :user_stat, dependent: :destroy

  # Validations
  validates :username, presence: true, uniqueness: true, length: { maximum: 50 }

  # Callbacks
  after_create :create_user_stat

  # ダッシュボード統計計算
  def calculate_dashboard_stats
    stats = user_stat || UserStat.new

    # 今日完了しているかと回数
    today_records = training_records.where(completed_at: Date.current.beginning_of_day..Date.current.end_of_day)
    today_completed = today_records.exists?
    today_count = today_records.count

    # 今月のポイント計算
    this_month_points = training_records
      .joins(:training)
      .where(completed_at: Date.current.beginning_of_month..Date.current.end_of_month)
      .sum('trainings.base_points * CASE trainings.difficulty
                                    WHEN 0 THEN 1.0
                                    WHEN 1 THEN 1.5
                                    WHEN 2 THEN 2.0
                                    ELSE 1.0 END')

    # 週間アクティビティ（過去7日間）
    weekly_activity = (0..6).map do |days_ago|
      date = days_ago.days.ago.to_date
      day_records = training_records.where(completed_at: date.beginning_of_day..date.end_of_day)
      points = day_records.joins(:training)
                          .sum('trainings.base_points * CASE trainings.difficulty
                                                        WHEN 0 THEN 1.0
                                                        WHEN 1 THEN 1.5
                                                        WHEN 2 THEN 2.0
                                                        ELSE 1.0 END')

      {
        day: date.strftime('%m/%d'),
        completed: day_records.exists?,
        points: points.to_i
      }
    end.reverse

    # お気に入りトレーニング計算
    favorite_training = training_records
      .joins(:training)
      .group('trainings.name')
      .count
      .max_by { |name, count| count }
      &.first

    {
      total_points: stats.total_points || 0,
      current_streak: stats.current_streak || 0,
      longest_streak: stats.longest_streak || 0,
      total_training_count: training_records.count,
      last_training_date: training_records.maximum(:completed_at)&.strftime('%Y-%m-%d'),
      this_month_points: this_month_points.to_i,
      today_completed: today_completed,
      today_count: today_count,
      today_remaining: [3 - today_count, 0].max,
      weekly_activity: weekly_activity,
      # 以下は後方互換性のため
      total_records: training_records.count,
      this_week_records: training_records.where(completed_at: Date.current.beginning_of_week..Date.current.end_of_week).count,
      this_month_records: training_records.where(completed_at: Date.current.beginning_of_month..Date.current.end_of_month).count,
      streak_days: stats.current_streak || 0,
      favorite_training: favorite_training
    }
  end

  # トレーニングトレンド計算
  def calculate_training_trends
    # 週間データ（過去8週間）
    weekly_data = (0..7).map do |weeks_ago|
      week_start = weeks_ago.weeks.ago.beginning_of_week
      week_end = weeks_ago.weeks.ago.end_of_week
      
      {
        week: week_start.strftime('%m/%d'),
        count: training_records.where(completed_at: week_start..week_end).count
      }
    end.reverse

    # 月間データ（過去6ヶ月）
    monthly_data = (0..5).map do |months_ago|
      month_start = months_ago.months.ago.beginning_of_month
      month_end = months_ago.months.ago.end_of_month
      
      {
        month: month_start.strftime('%Y/%m'),
        count: training_records.where(completed_at: month_start..month_end).count
      }
    end.reverse

    # トレーニング別頻度
    training_frequency = training_records
      .joins(:training)
      .group('trainings.name')
      .count
      .sort_by { |name, count| -count }
      .first(5)
      .to_h

    {
      weekly_data: weekly_data,
      monthly_data: monthly_data,
      training_frequency: training_frequency
    }
  end

  private

  def create_user_stat
    UserStat.create!(user: self)
  end
end
