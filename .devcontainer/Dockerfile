# 最適化されたDockerfile（方法B: Ruby公式イメージベース）
FROM ruby:3.4.2-bookworm

# --- Global ARGs & ENVs ---
ARG TZ
ENV TZ="$TZ"
ARG CLAUDE_CODE_VERSION=latest
ARG GIT_DELTA_VERSION=0.18.2
ARG ZSH_IN_DOCKER_VERSION=1.2.0
ARG USERNAME=node

# --- Root User Setup ---
USER root

# 1. Install system dependencies + Node.js/npm + Docker CE (統合で高速化)
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  gh \
  jq \
  nano \
  vim \
  curl \
  wget \
  build-essential \
  libssl-dev \
  libreadline-dev \
  zlib1g-dev \
  libncurses5-dev \
  libffi-dev \
  libgdbm-dev \
  libyaml-dev \
  libsqlite3-dev \
  sqlite3 \
  autoconf \
  bison \
  libbison-dev \
  libgdbm6 \
  libgdbm-dev \
  libdb-dev \
  postgresql-client \
  nodejs \
  npm \
  ca-certificates \
  lsb-release \
  && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
  && apt-get update \
  && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install git-delta
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# 3. Create docker group and configure the 'node' user (Ruby公式イメージにはnodeユーザーがないため作成)
RUN groupadd -f docker && \
    useradd -m -s /bin/bash ${USERNAME} && \
    usermod -aG sudo,docker ${USERNAME} && \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME} && \
    chmod 0440 /etc/sudoers.d/${USERNAME}

# 4. Create necessary directories for the node user
RUN mkdir -p \
    /usr/local/share/npm-global \
    /commandhistory \
    /workspace \
    /home/${USERNAME}/.claude

# 5. Set ownership for all node user directories at once
RUN chown -R ${USERNAME}:${USERNAME} \
    /usr/local/share/npm-global \
    /commandhistory \
    /workspace \
    /home/${USERNAME}

# --- Node User Setup ---
USER ${USERNAME}

# Set user-specific environment variables
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=${NPM_CONFIG_PREFIX}/bin:${PATH}
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano
ENV DEVCONTAINER=true

# Set the default working directory
WORKDIR /workspace

# Persist bash history
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && touch /commandhistory/.bash_history \
  && echo "${SNIPPET}" >> /home/${USERNAME}/.bashrc

# Install and configure zsh with plugins
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Install Rails and bundler directly with gem (RVM不要で高速化)
RUN gem install rails:8.0.2 bundler:2.6.2

# Install uv/uvx for Python package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add any shell configurations (RVM設定は不要)
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/${USERNAME}/.bashrc
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/${USERNAME}/.zshrc

# Install global npm packages
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}