ARG VARIANT=18-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

LABEL maintainer "Peter Schmalfeldt <me@peterschmalfeldt.com>"
LABEL description="SFCC Docs Remote Container"
LABEL vendor="SFCC DevOps"
LABEL version="1.0.0"

# Support Signed Commit Messages
RUN sudo apt-get update \
    && sudo apt-get install gnupg2 -y

# Install helpful scripts
RUN sudo apt-get install exa curl unzip -y

# Copy / Replace Dot Files
COPY dotfiles/.* /home/node

# Configure Git to use Global .gitattributes to prevent EOL and Whitespace Conflicts
RUN su node -c "git config --global core.attributesfile /home/node/.gitattributes"
RUN su node -c "git config --global pull.rebase false"

# Set Ownership
RUN sudo chown -R node /home/node

# Install ZSH Plugins
RUN su node -c "git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"
RUN su node -c "git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions"

# Persist Bash History
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R node /commandhistory \
    && echo $SNIPPET >> /home/node/.bashrc

# Prevent Error of missing notice file ( not sure why some people get that error )
RUN sudo touch /conda-notice.txt
