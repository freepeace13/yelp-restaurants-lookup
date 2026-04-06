#!/usr/bin/env bash
# Install Git + Node.js 20+ when missing (macOS / common Linux), then clone the repo.
# Usage:
#   ./scripts/bootstrap-unix.sh <git-clone-url> [folder-name]
# Example:
#   ./scripts/bootstrap-unix.sh https://github.com/freepeace13/yelp-restaurants-lookup.git

set -euo pipefail

usage() {
  echo "Usage: $0 <git-clone-url> [folder-name]"
  echo "Example: $0 https://github.com/freepeace13/yelp-restaurants-lookup.git"
  exit 1
}

[[ ${1:-} ]] || usage

REPO_URL="${1%/}"
shift || true
BASE="${REPO_URL##*/}"
DEFAULT_DIR="${BASE%.git}"
TARGET_DIR="${1:-$DEFAULT_DIR}"

need_sudo() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    return 1
  fi
  if ! command -v sudo >/dev/null 2>&1; then
    echo "This step needs administrator rights (sudo). Install sudo or run as root."
    exit 1
  fi
}

node_major() {
  if ! command -v node >/dev/null 2>&1; then
    echo 0
    return
  fi
  node -v | sed 's/^v//' | cut -d. -f1
}

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    return 0
  fi
  echo "Installing Git…"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "Homebrew is required on macOS. Install it from https://brew.sh then run this script again."
      exit 1
    fi
    brew install git
    return 0
  fi
  if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    case "${ID:-}" in
      ubuntu|debian|pop|linuxmint)
        need_sudo
        sudo apt-get update
        sudo apt-get install -y git ca-certificates curl
        ;;
      fedora|rhel|centos|rocky|almalinux)
        need_sudo
        sudo dnf install -y git ca-certificates curl
        ;;
      arch|manjaro)
        need_sudo
        sudo pacman -S --needed --noconfirm git ca-certificates curl
        ;;
      *)
        echo "Could not install Git automatically on this Linux ($ID). Install Git from your package manager, then run this script again."
        exit 1
        ;;
    esac
    return 0
  fi
  echo "Install Git, then run this script again."
  exit 1
}

ensure_node_20() {
  local major
  major=$(node_major)
  if [[ "$major" -ge 20 ]]; then
    echo "Node.js $(node -v) is OK."
    return 0
  fi
  if [[ "$major" -gt 0 ]]; then
    echo "Node.js $(node -v) is too old (need 20+). Upgrading…"
  else
    echo "Installing Node.js 20 LTS…"
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "Homebrew is required on macOS. Install it from https://brew.sh then run this script again."
      exit 1
    fi
    brew install node
    return 0
  fi

  if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    case "${ID:-}" in
      ubuntu|debian|pop|linuxmint)
        need_sudo
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        return 0
        ;;
      fedora|rhel|centos|rocky|almalinux)
        need_sudo
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
        return 0
        ;;
      arch|manjaro)
        need_sudo
        sudo pacman -S --needed --noconfirm nodejs npm
        ;;
      *)
        echo "Could not install Node.js automatically on this Linux ($ID)."
        echo "Install Node.js 20+ from https://nodejs.org (LTS) or your package manager, then run this script again."
        exit 1
        ;;
    esac
  else
    echo "Install Node.js 20+ from https://nodejs.org (LTS), then run this script again."
    exit 1
  fi
}

verify_node() {
  local major
  major=$(node_major)
  if [[ "$major" -lt 20 ]]; then
    echo "Node.js is still below v20 after install. Open a new terminal and run:"
    echo "  $0 \"$REPO_URL\" \"$TARGET_DIR\""
    exit 1
  fi
}

ensure_git
ensure_node_20
hash -r 2>/dev/null || true
verify_node

if [[ -e "$TARGET_DIR" ]]; then
  echo "Folder already exists: $TARGET_DIR — remove it or pick another name."
  exit 1
fi

echo "Cloning into $TARGET_DIR …"
git clone "$REPO_URL" "$TARGET_DIR"

echo ""
echo "Done. Next:"
echo "  cd $TARGET_DIR"
echo "  npm run setup"
echo "  (edit server/.env with your Yelp API key)"
echo "  npm run dev"
echo "Then open http://localhost:5173"
