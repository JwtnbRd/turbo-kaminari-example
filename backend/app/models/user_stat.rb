class UserStat < ApplicationRecord
  # Associations
  belongs_to :user

  # Validations
  validates :total_points, numericality: { greater_than_or_equal_to: 0 }
  validates :current_streak, numericality: { greater_than_or_equal_to: 0 }
  validates :longest_streak, numericality: { greater_than_or_equal_to: 0 }
  validates :total_training_count, numericality: { greater_than_or_equal_to: 0 }

  # Instance methods
  def recalculate!
    # TODO: 統計情報の再計算ロジック（営業日ベース）
    # holidays gemを使用したビジネスデイ計算

    records = user.training_records.order(:completed_at)

    # 基本統計の更新
    self.total_points = records.sum(:points_earned)
    self.total_training_count = records.count
    self.last_training_date = records.last&.completed_at&.to_date

    # 連続日数計算（営業日ベース）
    calculate_streaks(records)

    save!
  end

  private

  def calculate_streaks(records)
    require 'holidays'

    return if records.empty?

    # 営業日かどうかの判定
    def business_day?(date)
      return false if date.saturday? || date.sunday?
      return false if Holidays.on(date, :jp).any?
      true
    end

    # 連続日数計算ロジック（営業日ベース）
    dates = records.pluck(:completed_at).map(&:to_date).uniq.sort
    current_streak = 0
    max_streak = 0
    temp_streak = 1

    # 現在日付から過去に向かって連続営業日をチェック
    today = Date.current
    check_date = today

    # 今日から過去に向かって営業日の連続をチェック
    while business_day?(check_date) && dates.include?(check_date)
      current_streak += 1
      check_date -= 1.day

      # 土日祝をスキップ
      while !business_day?(check_date) && check_date > dates.first
        check_date -= 1.day
      end
    end

    # 最大連続日数を計算
    (1...dates.length).each do |i|
      prev_date = dates[i-1]
      curr_date = dates[i]

      # 前日が営業日の連続かチェック
      expected_date = prev_date + 1.day
      while !business_day?(expected_date) && expected_date < curr_date
        expected_date += 1.day
      end

      if expected_date == curr_date
        temp_streak += 1
      else
        max_streak = [max_streak, temp_streak].max
        temp_streak = 1
      end
    end

    max_streak = [max_streak, temp_streak].max

    self.current_streak = current_streak
    self.longest_streak = [longest_streak, max_streak, current_streak].max
  end
end