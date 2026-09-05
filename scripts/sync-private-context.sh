#!/bin/sh
# Clones the private agent-context repository into `.do-not-commit/`, then delegates to the script it ships on its
# `main` branch, which selects the branch matching this project.
#
# Runs on `bun install`. Without access to the private repository (public contributors), it skips silently.
set -eu

REMOTE="https://github.com/delairec/.do-not-commit.git"
CHECKOUT_DIR=".do-not-commit"
ENTRYPOINT="install.sh"

repo_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
checkout="$repo_root/$CHECKOUT_DIR"
export GIT_TERMINAL_PROMPT=0

if [ ! -d "$checkout/.git" ]; then
	if [ -e "$checkout" ]; then
		echo "private context: $CHECKOUT_DIR/ exists but is not a clone of $REMOTE, leaving it untouched"
		exit 0
	fi
	if ! git ls-remote --heads "$REMOTE" > /dev/null 2>&1; then
		echo "private context: repository not accessible, skipping (public contributors do not need it)"
		exit 0
	fi
	if ! git clone --quiet "$REMOTE" "$checkout"; then
		echo "private context: clone failed, skipping"
		exit 0
	fi
fi

git -C "$checkout" fetch --quiet origin || true
entrypoint=$(git -C "$checkout" show "origin/main:$ENTRYPOINT" 2> /dev/null) ||
	entrypoint=$(git -C "$checkout" show "main:$ENTRYPOINT" 2> /dev/null) || {
		echo "private context: $ENTRYPOINT not found on the main branch, skipping"
		exit 0
	}

printf '%s\n' "$entrypoint" | sh -s -- "$repo_root" || echo "private context: $ENTRYPOINT failed, skipping"
