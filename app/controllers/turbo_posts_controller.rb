class TurboPostsController < ApplicationController
  before_action :set_post, only: %i[ confirm unconfirm ]

  # GET /turbo_posts
  def index
    @posts = Post.page(params[:page])
  end

  # PATCH /turbo_posts/:id/confirm
  # Turbo本来の思想：テーブル部分のみを更新し、ページネーションは更新対象外
  def confirm
    Rails.logger.info "🟢 TURBO CONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    if @post.status != 'confirmed'
      @post.update!(status: 'confirmed')
      Rails.logger.info "✅ TURBO CONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ TURBO CONFIRM ACTION: Post #{@post.id} - Already confirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 TURBO CONFIRM ACTION: Rendering Turbo Stream (table only) with #{@posts.count} posts"
      end
      format.html { redirect_to turbo_posts_path }
    end
  end

  # PATCH /turbo_posts/:id/unconfirm
  # Turbo本来の思想：テーブル部分のみを更新し、ページネーションは更新対象外
  def unconfirm
    Rails.logger.info "🔴 TURBO UNCONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    if @post.status != 'unconfirmed'
      @post.update!(status: 'unconfirmed')
      Rails.logger.info "✅ TURBO UNCONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ TURBO UNCONFIRM ACTION: Post #{@post.id} - Already unconfirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 TURBO UNCONFIRM ACTION: Rendering Turbo Stream (table only) with #{@posts.count} posts"
      end
      format.html { redirect_to turbo_posts_path }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end
end
