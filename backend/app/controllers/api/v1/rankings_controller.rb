# frozen_string_literal: true

class Api::V1::RankingsController < Api::V1::BaseController
  # GET /api/v1/rankings/points
  def points
    rankings = build_points_ranking
    current_user_rank = find_user_rank(rankings, current_user.id)

    render json: {
      rankings: rankings,
      current_user_rank: current_user_rank
    }
  end

  # GET /api/v1/rankings/streaks
  def streaks
    rankings = build_streaks_ranking
    current_user_rank = find_user_rank(rankings, current_user.id)

    render json: {
      rankings: rankings,
      current_user_rank: current_user_rank
    }
  end

  private

  def build_points_ranking
    UserStat.joins(:user)
            .select('user_stats.*, users.username')
            .order(total_points: :desc)
            .limit(50)
            .each_with_index.map do |stat, index|
      {
        rank: index + 1,
        user_id: stat.user_id,
        username: stat.username,
        points: stat.total_points,
        streak: stat.current_streak
      }
    end
  end

  def build_streaks_ranking
    UserStat.joins(:user)
            .select('user_stats.*, users.username')
            .order(current_streak: :desc, total_points: :desc)
            .limit(50)
            .each_with_index.map do |stat, index|
      {
        rank: index + 1,
        user_id: stat.user_id,
        username: stat.username,
        points: stat.total_points,
        streak: stat.current_streak
      }
    end
  end

  def find_user_rank(rankings, user_id)
    ranking = rankings.find { |r| r[:user_id] == user_id }
    return ranking if ranking

    # ランキング外の場合、現在のユーザーの順位を計算
    user_stat = current_user.user_stat
    return nil unless user_stat

    {
      rank: calculate_actual_rank(user_stat),
      user_id: user_id,
      username: current_user.username,
      points: user_stat.total_points,
      streak: user_stat.current_streak
    }
  end

  def calculate_actual_rank(user_stat)
    UserStat.where('total_points > ?', user_stat.total_points).count + 1
  end
end
