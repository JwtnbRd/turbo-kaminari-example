class ProblematicPostsController < ApplicationController
  before_action :set_post, only: %i[ confirm unconfirm ]

  # GET /problematic_posts
  def index
    @posts = Post.page(params[:page])
  end

  # PATCH /problematic_posts/:id/confirm
  # 問題再現用のconfirmアクション（statusをconfirmedに更新）
  def confirm
    Rails.logger.info "🔵 PROBLEMATIC CONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    if @post.status != 'confirmed'
      @post.update!(status: 'confirmed')
      Rails.logger.info "✅ PROBLEMATIC CONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ PROBLEMATIC CONFIRM ACTION: Post #{@post.id} - Already confirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 PROBLEMATIC CONFIRM ACTION: Rendering Turbo Stream with #{@posts.count} posts"
      end
      format.html { redirect_to problematic_posts_path }
    end
  end

  # PATCH /problematic_posts/:id/unconfirm
  # statusをunconfirmedに戻すアクション
  def unconfirm
    Rails.logger.info "🔴 PROBLEMATIC UNCONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    if @post.status != 'unconfirmed'
      @post.update!(status: 'unconfirmed')
      Rails.logger.info "✅ PROBLEMATIC UNCONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ PROBLEMATIC UNCONFIRM ACTION: Post #{@post.id} - Already unconfirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 PROBLEMATIC UNCONFIRM ACTION: Rendering Turbo Stream with #{@posts.count} posts"
      end
      format.html { redirect_to problematic_posts_path }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end
end
