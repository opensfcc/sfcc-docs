export ZSH=$HOME/.oh-my-zsh

CASE_SENSITIVE="true"
COMPLETION_WAITING_DOTS="true"
DISABLE_AUTO_TITLE="true"
DISABLE_AUTO_UPDATE="true"
DISABLE_UNTRACKED_FILES_DIRTY="true"
DISABLE_UPDATE_PROMPT="true"
ENABLE_CORRECTION="true"
HYPHEN_INSENSITIVE="true"
ZSH_THEME="codespaces"

export EDITOR=nano
export VISUAL=nano

plugins=(git zsh-syntax-highlighting zsh-autosuggestions)

source $ZSH/oh-my-zsh.sh
