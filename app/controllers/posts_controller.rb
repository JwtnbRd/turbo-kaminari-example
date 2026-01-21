class PostsController < ApplicationController
  before_action :set_post, only: %i[ show edit update destroy confirm unconfirm ]

  # GET /posts or /posts.json
  def index
    @posts = Post.page(params[:page])
  end

  # PATCH /posts/1/confirm
  # 問題再現用のconfirmアクション（statusをconfirmedに更新）
  def confirm
    Rails.logger.info "🔵 CONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    # 重複実行を防ぐ
    if @post.status != 'confirmed'
      @post.update!(status: 'confirmed')
      Rails.logger.info "✅ CONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ CONFIRM ACTION: Post #{@post.id} - Already confirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 CONFIRM ACTION: Rendering Turbo Stream with #{@posts.count} posts"
        # 専用のTurbo Streamテンプレートを使用
      end
      format.html { redirect_to posts_path }
    end
  end

  # PATCH /posts/1/unconfirm
  # statusをunconfirmedに戻すアクション
  def unconfirm
    Rails.logger.info "🔴 UNCONFIRM ACTION: Post #{@post.id} - Current status: #{@post.status}"

    # 重複実行を防ぐ
    if @post.status != 'unconfirmed'
      @post.update!(status: 'unconfirmed')
      Rails.logger.info "✅ UNCONFIRM ACTION: Post #{@post.id} - Status updated to: #{@post.status}"
    else
      Rails.logger.info "⚠️ UNCONFIRM ACTION: Post #{@post.id} - Already unconfirmed, no update needed"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
        Rails.logger.info "📡 UNCONFIRM ACTION: Rendering Turbo Stream with #{@posts.count} posts"
        # 専用のTurbo Streamテンプレートを使用
      end
      format.html { redirect_to posts_path }
    end
  end

  # GET /posts/1 or /posts/1.json
  def show
  end

  # GET /posts/new
  def new
    @post = Post.new
  end

  # GET /posts/1/edit
  def edit
  end

  # POST /posts or /posts.json
  def create
    @post = Post.new(post_params)

    respond_to do |format|
      if @post.save
        format.html { redirect_to @post, notice: "Post was successfully created." }
        format.json { render :show, status: :created, location: @post }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @post.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /posts/1 or /posts/1.json
  def update
    respond_to do |format|
      if @post.update(post_params)
        format.html { redirect_to @post, notice: "Post was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @post }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @post.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /posts/1 or /posts/1.json
  def destroy
    @post.destroy!

    respond_to do |format|
      format.html { redirect_to posts_path, notice: "Post was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_post
      @post = Post.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def post_params
      params.expect(post: [ :title, :status ])
    end
end
